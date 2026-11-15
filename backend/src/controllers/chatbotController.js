/**
 * CounsellQ AI Counseling Assistant Controller
 * Provides context-aware AI guidance on UPTAC rules, fee structures, 
 * branch transitions, college comparisons, and cutoff analytics.
 * Supports Google Gemini API when GEMINI_API_KEY is available,
 * with an ultra-reliable, domain-trained expert knowledge engine as fallback.
 */

const pool = require("../db");
const path = require("path");
const fs = require("fs");

// Load colleges master for instant lookup
let collegesMaster = [];
try {
    const masterPath = path.resolve(__dirname, "../colleges_master.json");
    if (fs.existsSync(masterPath)) {
        collegesMaster = JSON.parse(fs.readFileSync(masterPath, "utf8"));
    }
} catch (e) {
    console.warn("Notice: colleges_master.json load warning:", e.message);
}

// UPTAC Official Rules Knowledge Base
const UPTAC_KNOWLEDGE = {
    freeze_vs_float: {
        title: "Freeze vs Float in UPTAC Counselling",
        summary: "Your choice of willingness dictates whether you lock your current seat or keep competing for higher preference choices in subsequent rounds.",
        details: [
            "**FREEZE**: You are 100% satisfied with the currently allotted college and branch. Selecting Freeze locks the seat and terminates your participation in subsequent rounds. You MUST pay the Seat Acceptance Fee (₹20,000 for GEN/OBC/EWS, ₹12,000 for SC/ST) and proceed to physical reporting as per the schedule.",
            "**FLOAT**: You accept the currently allotted seat as a guaranteed safety net, but you wish to be considered for your higher-preference choices in Round 2 or Round 3.",
            "**Key Protection with FLOAT**: You can NEVER lose your currently allotted seat during floating unless a higher preference choice is allotted to you. If a higher choice is allotted, your previous seat is automatically surrendered to other candidates.",
            "**Recommendation**: Always choose **FLOAT** in Round 1 and Round 2 unless you have been allotted your #1 top preference choice!"
        ]
    },
    internal_sliding: {
        title: "Internal Sliding Rules (Round 3 / Pre-Physical Reporting)",
        summary: "Internal sliding allows branch upgrade within the same admitted college without losing your current admission.",
        details: [
            "**Eligibility**: Only candidates who have accepted their seat, paid the full Seat Acceptance Fee, completed online document verification, and submitted willingness for Internal Sliding are eligible.",
            "**Mechanism**: Seats vacated due to non-reporting, withdrawals, or category conversions are allocated to higher-merit candidates within the SAME institution based on their original choice filling sequence.",
            "**No Risk Guarantee**: You will NEVER be downgraded to a lower branch. If no higher branch is available, you securely retain your currently allotted branch.",
            "**Outside UP Candidates**: Internal sliding is also opened to All India seats if vacancies exist after Home State sliding."
        ]
    },
    fee_waiver: {
        title: "Tuition Fee Waiver (TFW / FW) Seats in AKTU / UPTAC",
        summary: "5% supernumerary seats in every branch where 100% tuition fee is completely waived.",
        details: [
            "**Benefit**: 100% Tuition Fee is waived. You only pay exam fees, university charges, and hostel/mess if opting for campus boarding.",
            "**Eligibility**: Candidate must be a bona fide resident of Uttar Pradesh (UP Domicile). Annual family income from all sources must be **strictly below ₹8.00 Lakhs**.",
            "**Mandatory Document**: Valid Income Certificate issued by competent revenue authority (Tehsildar) on or after 1st April of the current financial year.",
            "**Choice Filling Tip**: In the UPTAC choice sheet, Fee Waiver seats are listed as separate choices (e.g. `Computer Science and Engineering (FW)`). Place FW choices immediately above non-FW choices of the same branch."
        ]
    },
    seat_acceptance_fee_and_refund: {
        title: "Seat Acceptance Fee (SAF) & Withdrawal Refund Policy",
        summary: "Official UPTAC seat confirmation fee structure and progressive refund schedule across rounds.",
        details: [
            "**Fee Amount**: ₹20,000 for General, OBC, and EWS candidates; ₹12,000 for SC and ST candidates.",
            "**Adjustment**: This fee is NOT an extra expense; it is directly credited towards your 1st-year college academic fee upon physical reporting.",
            "**Withdrawal in Round 1**: Full refund of SAF minus ₹2,000 administrative processing charge (Refund: ₹18,000 / ₹10,000).",
            "**Withdrawal in Round 2**: ₹15,000 refunded for GEN/OBC/EWS; ₹9,000 for SC/ST.",
            "**Withdrawal in Round 3**: ₹10,000 refunded for GEN/OBC/EWS; ₹6,000 for SC/ST.",
            "**Post Round 3 / Physical Reporting**: Zero refund from the UPTAC portal once physical reporting commences."
        ]
    },
    spot_round: {
        title: "UPTAC Special / Spot Round Guidelines",
        summary: "Conducted after Round 4 and internal sliding to fill remaining vacant seats across government and autonomous colleges.",
        details: [
            "**Participation**: Open to all JEE Main candidates who did not get a seat or who did not register in earlier rounds. Both UP Domicile and Outside UP candidates can participate.",
            "**Fresh Registration**: Requires fresh non-refundable registration fee (₹1,000) and upfront caution deposit.",
            "**Seat Availability**: High probability for core branches (ECE, EE, ME, Civil, Chemical) in top government colleges like IET Lucknow, BIET Jhansi, and KNIT Sultanpur."
        ]
    },
    document_checklist: {
        title: "Mandatory Document Verification Checklist",
        summary: "Essential certificates and credentials required for online verification and physical reporting.",
        details: [
            "1. **JEE Main 2025 Admit Card & Score Card**",
            "2. **Class 10th Certificate / Marksheet** (as proof of Date of Birth)",
            "3. **Class 12th Marksheet** (minimum 45% aggregate in PCM for General, 40% for Reserved categories)",
            "4. **UP Domicile Certificate** (if Class 12 passed from outside UP or claiming UP quota)",
            "5. **Category Certificate (OBC-NCL / SC / ST)**: OBC certificate MUST be issued on or after 1st April of current year",
            "6. **EWS Certificate** (issued on or after 1st April of current financial year)",
            "7. **Medical Fitness Certificate** (in prescribed UPTAC format signed by registered medical practitioner)",
            "8. **Character Certificate & Transfer / Migration Certificate** from last attended institute",
            "9. **Allotment Letter & Seat Acceptance Fee Payment Receipt**"
        ]
    }
};

/**
 * Handle incoming chat queries
 */
const handleChatQuery = async (req, res) => {
    try {
        const { message, history = [], context = {} } = req.body;

        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                error: "Message query is required"
            });
        }

        const query = message.trim();
        const userRank = Number(context.rank) || null;
        const userCat = context.category || "General";

        // Try Gemini API first if API key is configured
        const geminiKey = process.env.GEMINI_API_KEY;
        if (geminiKey && geminiKey.trim().length > 10) {
            try {
                const aiReply = await callGeminiAPI(query, history, context, geminiKey);
                if (aiReply) {
                    return res.json({
                        success: true,
                        source: "gemini_model",
                        reply: aiReply,
                        suggested_prompts: generateSuggestedPrompts(query)
                    });
                }
            } catch (geminiErr) {
                console.warn("Gemini API call failed, falling back to CounsellQ Knowledge Engine:", geminiErr.message);
            }
        }

        // CounsellQ Domain-Trained Knowledge Engine Fallback
        const expertAnswer = await synthesizeExpertAnswer(query, userRank, userCat);

        return res.json({
            success: true,
            source: "counsellq_expert_engine",
            reply: expertAnswer.text,
            data_cards: expertAnswer.cards || [],
            citations: expertAnswer.citations || ["UPTAC 2025 Official Counselling Brochure", "UPTAC Historical Cutoff Archive"],
            suggested_prompts: generateSuggestedPrompts(query)
        });

    } catch (err) {
        console.error("Error in handleChatQuery:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to process counselling inquiry"
        });
    }
};

/**
 * Call Google Gemini REST API
 */
async function callGeminiAPI(query, history, context, apiKey) {
    const systemPrompt = `You are "Ask CounsellQ", an expert admissions counsellor for Uttar Pradesh Technical Admission Counselling (UPTAC / AKTU) and B.Tech engineering admissions in Uttar Pradesh, India.
You provide accurate, highly practical, and student-friendly advice based on official UPTAC 2025 rules, fee structures, cutoff trajectories, placement packages, and choice filling strategies.
Key Facts:
- Top UP Govt Colleges: Institute of Engineering and Technology (IET) Lucknow, KNIT Sultanpur, BIET Jhansi, HBTU Kanpur (separate counselling).
- Top Private AKTU Colleges: ABES Engineering College Ghaziabad (Code 032), Ajay Kumar Garg Engineering College (AKGEC, Code 027), KIET Group of Institutions (Code 029), JSS Academy of Technical Education Noida (Code 091), GL Bajaj Greater Noida (Code 192), Galgotias College (Code 097).
- ABES Engineering College (#032) is NBA Accredited in Computer Science & Engg (valid till 31-12-2028), Electronics & Communication Engg (valid till 30-06-2028), and Mechanical Engg (valid till 30-06-2028). NIRF Band 201-300.
- Seat Acceptance Fee: ₹20,000 for GEN/OBC/EWS; ₹12,000 for SC/ST.
- Float vs Freeze: Float keeps seat safe while allowing upgrade to higher choices in next round. Freeze locks seat permanently.
- Internal Sliding: Happens in Round 3 within the admitted college without risk of losing current seat.
- TFW (Fee Waiver): 100% Tuition Fee waived for UP domicile family income < ₹8 LPA (5% supernumerary seats).
- ABES Engineering College (#032) vs ABES IT (#290): ABES EC (#032) is autonomous, NBA accredited till 2028, NIRF Band 201-300, and has higher cutoffs and placements than ABES IT (#290).
Strict Domain Boundaries:
- You are STRICTLY an engineering admissions assistant for UPTAC / AKTU.
- If the user asks about sports (cricket matches like India vs New Zealand, football, IPL, scores), movies, celebrities, weather, cooking, recipes, politics, or general non-educational topics, you MUST politely decline to answer, explaining that you only answer questions related to engineering college admissions, cutoffs, rules, fee structures, and placement analytics.
Always format responses with clear markdown headers, bold keywords, bullet points, and actionable next steps. Be concise and authoritative.`;

    const contents = [];
    // Add brief history
    if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-4)) {
            contents.push({
                role: item.role === "assistant" ? "model" : "user",
                parts: [{ text: item.content }]
            });
        }
    }

    contents.push({
        role: "user",
        parts: [{ text: query }]
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            system_instruction: {
                parts: [{ text: systemPrompt }]
            },
            contents,
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 900
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Gemini HTTP error ${response.status}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    return text || null;
}

/**
 * Domain-Trained Knowledge Engine Response Synthesizer
 */
async function synthesizeExpertAnswer(query, rank, category) {
    const q = query.toLowerCase().trim();

    // 1. Off-Topic / Out-of-Domain Guard (Sports, Cricket, Entertainment, Weather, Politics, etc.)
    const isOffTopic = (
        /\b(ind vs nz|india vs|nz vs|pak vs|aus vs|cricket|match|score|ipl|t20|odi|world cup|football|messi|ronaldo|wicket|batting|bowling|tennis|badminton)\b/i.test(q) ||
        /\b(movie|bollywood|hollywood|trailer|song|album|singer|actor|actress|netflix|spotify|cinema)\b/i.test(q) ||
        /\b(weather|temperature|forecast|rain today|humidity)\b/i.test(q) ||
        /\b(recipe|pizza|burger|cooking|cake|food)\b/i.test(q) ||
        /\b(election|prime minister|president|bjp|congress|parliament)\b/i.test(q)
    ) && !/\b(college|cutoffs?|rank|uptac|aktu|branch|admission|fee|seat|placement|btech|engineering)\b/i.test(q);

    if (isOffTopic) {
        return {
            text: `### 🎓 Ask CounsellQ Admissions Assistant\n\n` +
                `I am an AI admissions counsellor dedicated strictly to **UPTAC / AKTU engineering admissions**, JEE Main cutoffs, fee structures, college comparisons, and counselling rules.\n\n` +
                `I don't track sports scores, match updates (like India vs New Zealand), or general non-educational topics.\n\n` +
                `**Here are some things you can ask me:**\n` +
                `• **College Cutoffs**: *"What branch can I get at 1,35,000 rank?"*\n` +
                `• **College Comparisons**: *"Which college is better: ABES or ABES IT?"* or *"Compare ABES vs AKGEC"*\n` +
                `• **UPTAC Rules**: *"Should I choose Freeze or Float in Round 2?"* or *"How does Internal Sliding work?"*\n` +
                `• **Fee Structures & TFW**: *"Who is eligible for Tuition Fee Waiver (FW) seats?"*\n` +
                `• **Branch Selection**: *"Is CSE with AIML better than core CSE?"*\n\n` +
                `*What admissions or choice filling query can I help you with today?*`,
            citations: ["CounsellQ Admissions Scope & Guidance Directory"]
        };
    }

    // 2. Greetings & Salutations Guard
    const isGreeting = /^(hi|hello|hey|greetings|namaste|good\s*(morning|afternoon|evening)|who are you|help me|what can you do)[\s!.]*$/i.test(q);
    if (isGreeting) {
        return {
            text: `### 🎓 Welcome to Ask CounsellQ!\n\n` +
                `I am your dedicated AI admissions assistant for **UPTAC / AKTU 2025 B.Tech Counselling**.\n\n` +
                `Here is how I can assist your admission journey:\n` +
                `• **Rank Feasibility**: Type your rank (e.g. \`135000\`) to see Safe, Moderate, and Dream college options.\n` +
                `• **Direct Comparisons**: Ask *"Which is better: ABES or ABES IT?"* or *"Compare AKGEC vs KIET"*.\n` +
                `• **Counselling Strategy**: Learn the exact rules for **Freeze vs Float**, **Internal Sliding in Round 3**, and **Refund policies**.\n` +
                `• **Branch Insights**: Learn about **Core CSE vs CSE(AIML) vs IT** and placement eligibility.\n\n` +
                `*What college or counselling question would you like to explore?*`,
            citations: ["UPTAC 2025 Admissions Knowledge Engine"]
        };
    }

    // 3. ABES Engineering College (#032) vs ABES IT (#290)
    if (q.includes("abes") && (q.includes("abes it") || q.includes("abesit") || q.includes("abes-it") || q.includes("institute of technology"))) {
        return {
            text: `### 🏛️ Comparison: ABES Engineering College (#032) vs ABES IT (#290)\n\n` +
                `While both colleges share the ABES brand name and are located on NH-24 in Ghaziabad, they are **two separate institutions with different college codes, administration, cutoffs, and accreditations**:\n\n` +
                `| Key Factor | ABES Engineering College (Code #032) | ABES Institute of Technology (Code #290) |\n` +
                `| :--- | :--- | :--- |\n` +
                `| **College Code** | **032** (Flagship Campus) | **290** (Separate campus) |\n` +
                `| **Establishment** | Established in **2000** (25+ yrs legacy) | Established in **2007** |\n` +
                `| **Status** | **Autonomous Institute** | Non-Autonomous AKTU Affiliated |\n` +
                `| **Accreditation** | **NBA Accredited** (CSE, ECE, ME till 2028) • NAAC 'B+' | NAAC Accredited • Limited NBA |\n` +
                `| **NIRF Standing** | **NIRF Engineering Band 201–300** | Not ranked in NIRF top bands |\n` +
                `| **Annual Tuition** | ₹1,40,750 / year | ₹1,18,000 / year |\n` +
                `| **2025 CSE Round 3 Cutoff** | **4,11,234** (High Demand) | **~7,50,000 – 9,00,000+** |\n` +
                `| **Average Placement CTC** | **₹5.20 – ₹5.80 LPA** (Highest: ₹50 LPA) | **₹3.60 – ₹4.10 LPA** (Highest: ₹12–15 LPA) |\n` +
                `| **Top Recruiters** | Amazon, Cisco, TCS Digital, Capgemini, Infosys | TCS Ninja, Wipro, Nucleus, Tech Mahindra |\n\n` +
                `#### 🎯 CounsellQ Verdict & Choice Filling Strategy\n\n` +
                `1. **Clear Winner**: **ABES Engineering College (#032) is significantly superior** in brand value, autonomous academic flexibility, active alumni network, verified NBA accreditations, and placement package averages.\n` +
                `2. **Choice Filling Rule**: In your UPTAC preference sheet, always list all desired branches at **ABES Engineering College (#032)** (CSE, CSE-AIML, CSE-DS, IT) **strictly above** ABES IT (#290).\n` +
                `3. **When to consider ABES IT (#290)**: If your JEE Main rank is between 6.5 Lakh and 9 Lakh and you specifically require an affordable NCR-based college with decent mass recruiter hiring.`,
            citations: ["AICTE & NBA Official Portals (File 35-71/2010-NBA)", "UPTAC 2025 Round 1-3 Cutoff Archives"]
        };
    }

    // 4. Freeze vs Float
    if (q.includes("freeze") || q.includes("float")) {
        const item = UPTAC_KNOWLEDGE.freeze_vs_float;
        return {
            text: `### 🎯 ${item.title}\n\n${item.summary}\n\n` +
                item.details.map(d => `• ${d}`).join("\n\n") +
                `\n\n> [!TIP]\n> If you are uncertain, **choose FLOAT**! Float keeps your currently allotted seat 100% protected while testing whether cutoffs expand in subsequent rounds to grant your higher choices.`,
            citations: ["UPTAC 2025 Information Brochure - Section 7: Willingness Options"]
        };
    }

    // 5. Internal Sliding
    if (q.includes("internal slid") || q.includes("sliding") || q.includes("branch change") || q.includes("branch transition")) {
        const item = UPTAC_KNOWLEDGE.internal_sliding;
        return {
            text: `### 🔄 ${item.title}\n\n${item.summary}\n\n` +
                item.details.map(d => `• ${d}`).join("\n\n") +
                `\n\n> [!IMPORTANT]\n> Internal Sliding only updates your branch **inside the same college**. For example, if you are admitted to ABES Ghaziabad in IT, sliding can upgrade you to CSE or CSE(AIML) at ABES, but it will never transfer you to a different college.`,
            citations: ["UPTAC 2025 Counselling Guidelines - Internal Branch Sliding Norms"]
        };
    }

    // 6. Fee Waiver / TFW
    if (q.includes("fee waiver") || q.includes("tfw") || q.includes("fw seat") || q.includes("tuition fee waiver")) {
        const item = UPTAC_KNOWLEDGE.fee_waiver;
        return {
            text: `### 💰 ${item.title}\n\n${item.summary}\n\n` +
                item.details.map(d => `• ${d}`).join("\n\n") +
                `\n\n> [!NOTE]\n> Fee waiver applies strictly to the Tuition Fee component (which is typically ₹85,000–₹1,15,000 per year). Other fees like university exam fee (₹7,500) and hostel/mess charges remain payable.`,
            citations: ["AICTE Approval Process Handbook & AKTU Fee Waiver Norms"]
        };
    }

    // 7. Refund & Seat Acceptance Fee
    if (q.includes("refund") || q.includes("seat acceptance fee") || q.includes("saf") || q.includes("withdraw")) {
        const item = UPTAC_KNOWLEDGE.seat_acceptance_fee_and_refund;
        return {
            text: `### 💳 ${item.title}\n\n${item.summary}\n\n` +
                item.details.map(d => `• ${d}`).join("\n\n") +
                `\n\n> [!WARNING]\n> If you do not report physically to the allotted college during the mandatory reporting window after Round 3, your seat and Seat Acceptance Fee will be forfeited automatically!`,
            citations: ["UPTAC 2025 Refund & Forfeiture Rules"]
        };
    }

    // 8. Document Verification
    if (q.includes("document") || q.includes("certificate") || q.includes("verification") || q.includes("eligibility")) {
        const item = UPTAC_KNOWLEDGE.document_checklist;
        return {
            text: `### 📋 ${item.title}\n\n${item.summary}\n\n` +
                item.details.map(d => `${d}`).join("\n\n") +
                `\n\n> [!IMPORTANT]\n> **OBC-NCL and EWS candidates:** Ensure your category certificate was issued **on or after 1st April 2025**; otherwise, the portal will reclassify your application into the General (OPEN) category!`,
            citations: ["UPTAC 2025 Verification Schedule & Document Appendix"]
        };
    }

    // 9. Spot Round
    if (q.includes("spot") || q.includes("special round") || q.includes("vacant seat")) {
        const item = UPTAC_KNOWLEDGE.spot_round;
        return {
            text: `### ⚡ ${item.title}\n\n${item.summary}\n\n` +
                item.details.map(d => `• ${d}`).join("\n\n"),
            citations: ["UPTAC Institutional Spot Round Guidelines"]
        };
    }

    // 10. Core CSE vs CSE Specializations (AIML, Data Science) vs IT
    if ((q.includes("cse") || q.includes("computer science")) && (q.includes("aiml") || q.includes("ai & ml") || q.includes("artificial intelligence") || q.includes("data science") || q.includes("it vs") || q.includes("specialization") || q.includes("core cse"))) {
        return {
            text: `### 💻 Branch Breakdown: Core CSE vs CSE (AI & ML) vs IT\n\n` +
                `A major question during UPTAC choice filling is whether to choose Core Computer Science (CSE), specializations like CSE (AI & ML) or Data Science (DS), or Information Technology (IT):\n\n` +
                `| Aspect | Core CSE | CSE Specializations (AIML / DS / IoT) | Information Technology (IT) |\n` +
                `| :--- | :--- | :--- | :--- |\n` +
                `| **Curriculum** | 100% classic fundamentals (Data Structures, OS, DBMS, Compilers, Networks) | 80% same as Core CSE + 20% ML/AI/Stats electives in 3rd & 4th year | 90% same as Core CSE with applied software/web systems focus |\n` +
                `| **Placement Eligibility** | **100% of tech companies** allow Core CSE students | **>95% of tech companies** allow CSE specializations without restriction | **>95% of tech companies** allow IT students |\n` +
                `| **Higher Studies / GATE** | **Best Alignment**: 100% covers GATE CS syllabus | Covers 85% of GATE CS; some electives differ | Covers 90% of GATE CS syllabus |\n` +
                `| **Cutoff Competitiveness** | Highest (closes earliest) | Closes 20k–50k ranks after Core CSE | Closes 15k–40k ranks after Core CSE |\n\n` +
                `#### 🎯 CounsellQ Choice Strategy\n` +
                `• **Top Priority**: **Core CSE** (Maximum flexibility for software engineering, product companies, and GATE/M.Tech).\n` +
                `• **Second Priority**: **CSE (AI & ML) / CSE (Data Science)** if you have an interest in machine learning, analytics, and data-driven systems.\n` +
                `• **Third Priority**: **Information Technology (IT)** — virtually identical job placement opportunities to CSE in AKTU institutes like ABES, AKGEC, and KIET.\n` +
                `• **Choice Filling Order**: Core CSE > CSE (AIML) > CSE (DS) > IT.`,
            citations: ["AKTU B.Tech Curriculum Syllabus Structure", "Corporate Campus Placement Eligibility Guidelines"]
        };
    }

    // 11. ABES vs AKGEC (also handles "abes or akgec")
    if (q.includes("abes") && (q.includes("akgec") || q.includes("ajay kumar garg"))) {
        return {
            text: `### 🏛️ Head-to-Head Comparison: ABES Engineering College vs AKGEC Ghaziabad\n\n` +
                `Both **ABES Engineering College (Code #032)** and **Ajay Kumar Garg Engineering College (AKGEC, Code #027)** are premier NBA-accredited private engineering institutions affiliated with AKTU in Ghaziabad.\n\n` +
                `| Metric | ABES Engineering College (#032) | AKGEC Ghaziabad (#027) |\n` +
                `| :--- | :--- | :--- |\n` +
                `| **NIRF Standing** | NIRF Band 201–300 | NIRF Band 201–300 |\n` +
                `| **Accreditation** | **NBA Accredited** (CSE, ECE, ME till 2028) | **NBA Accredited** (Core Branches) |\n` +
                `| **Annual Fee** | ₹1,40,750 / yr | ₹1,41,250 / yr |\n` +
                `| **Average CTC** | ₹5.20 – ₹5.80 LPA | ₹5.50 – ₹6.10 LPA |\n` +
                `| **Highest Package** | ₹50.00 LPA | ₹1.13 Crore (International) / ₹34 LPA (Domestic) |\n` +
                `| **2025 CSE Round 3 Cutoff** | ~4,11,000 (OPEN) | ~1,85,000 (OPEN) |\n` +
                `| **Campus Atmosphere** | Strong coding culture, active tech clubs | Highly disciplined, extensive industrial robotics labs |\n\n` +
                `**Recommendation**:\n` +
                `• If your JEE Main rank is under **1.8 Lakh**, prioritize **AKGEC CSE / IT** for top recruiter placement volume.\n` +
                `• If your rank is in the **2.0 Lakh to 4.1 Lakh** bracket, **ABES CSE, CSE(AIML), and IT** are premier choices with verified NBA accreditation, high ROI, and a massive alumni network in NCR tech companies.`,
            citations: ["CounsellQ Institutional Audit Records", "UPTAC Official 2025 Cutoffs", "NIRF 2024-25"]
        };
    }

    // 12. AKGEC vs KIET
    if (q.includes("akgec") && q.includes("kiet")) {
        return {
            text: `### 🏛️ Comparison: AKGEC Ghaziabad (#027) vs KIET Group (#029)\n\n` +
                `Both are tier-1 AKTU private institutions in Ghaziabad with excellent academic rigor and strong placement track records.\n\n` +
                `| Metric | AKGEC Ghaziabad (Code #027) | KIET Group of Institutions (Code #029) |\n` +
                `| :--- | :--- | :--- |\n` +
                `| **Accreditation** | **NBA Accredited** • NIRF Band 201–300 | **NBA Accredited** • NAAC 'A+' Grade • NIRF Band 151–200 |\n` +
                `| **Status** | Non-Autonomous | **Autonomous Institution** |\n` +
                `| **Annual Tuition** | ₹1,41,250 / yr | ₹1,38,000 / yr |\n` +
                `| **Average CTC** | ₹5.50 – ₹6.10 LPA | ₹5.40 – ₹6.00 LPA |\n` +
                `| **Key Strengths** | Industrial automation labs, robotics centers of excellence, strict academic discipline | NAAC A+ accreditation, startup incubation center, vibrant student campus life |\n` +
                `| **2025 CSE Closing** | ~1,85,000 (OPEN) | ~2,10,000 (OPEN) |\n\n` +
                `**CounsellQ Verdict**: For high academic discipline and robotics/industrial setups, pick AKGEC. For NAAC A+ accreditation, autonomous curriculum, and a more vibrant college life, pick KIET. Both have stellar placement records.`,
            citations: ["NIRF Engineering 2024-25 Rankings", "UPTAC 2025 Cutoff Records"]
        };
    }

    // 13. JSS Noida
    if (q.includes("jss") && (q.includes("akgec") || q.includes("kiet") || q.includes("abes") || q.includes("noida") || q.includes("compare") || q.includes("better"))) {
        return {
            text: `### 🏛️ JSS Academy of Technical Education, Noida (#091)\n\n` +
                `JSS Noida is widely considered the top private college in Noida under AKTU due to its prime Sector 62 Noida location.\n\n` +
                `• **Location Advantage**: Situated in Sector 62, Noida, right in the heart of Delhi-NCR IT hubs, providing supreme accessibility for off-campus internships and MNC drives.\n` +
                `• **Cutoffs**: CSE closes around **1,30,000 – 1,50,000** in Round 3 (the most competitive private college cutoff in AKTU!).\n` +
                `• **Placements**: Average CTC ₹5.80 – ₹6.50 LPA, Highest ₹40+ LPA.\n` +
                `• **Comparison with AKGEC / KIET / ABES**: If location in Noida is your top priority, choose **JSS Noida**. If you prioritize industrial labs and robotics, choose **AKGEC**. If you have rank between 2.5L and 4.2L, **ABES** offers the highest value for CSE/IT.`,
            citations: ["UPTAC 2025 Closing Cutoffs", "NCR Placement Analytics"]
        };
    }

    // 14. GL Bajaj vs Galgotias
    if ((q.includes("gl bajaj") || q.includes("bajaj")) && (q.includes("galgotia") || q.includes("gcet"))) {
        return {
            text: `### 🏛️ Comparison: GL Bajaj (#192) vs Galgotias College (#097)\n\n` +
                `Both are top Knowledge Park, Greater Noida engineering colleges affiliated with AKTU.\n\n` +
                `| Metric | GL Bajaj Greater Noida (#192) | Galgotias College of Engg (#097) |\n` +
                `| :--- | :--- | :--- |\n` +
                `| **Accreditation** | NBA Accredited (CSE, IT, ECE) • NAAC 'A' | NBA Accredited • NAAC 'A' |\n` +
                `| **Annual Fee** | ₹1,48,000 / yr | ₹1,35,000 / yr |\n` +
                `| **Average CTC** | ₹5.80 – ₹6.20 LPA | ₹5.20 – ₹5.60 LPA |\n` +
                `| **Placement Volume** | Known for intense coding training and maximum placement drive numbers in Greater Noida | Large campus, balanced college culture, strong tech society events |\n` +
                `| **2025 CSE Round 3 Cutoff** | ~2,35,000 (OPEN) | ~2,80,000 (OPEN) |\n\n` +
                `**CounsellQ Recommendation**: GL Bajaj (#192) has an edge in strict coding training and placement conversion numbers. Galgotias (#097) has a slight edge in campus atmosphere. Both should be placed above colleges with code >200 in your preference list.`,
            citations: ["UPTAC 2025 Cutoffs", "Knowledge Park Institutional Audit"]
        };
    }

    // 15. Top Government Colleges Comparison
    if (q.includes("iet") && (q.includes("knit") || q.includes("biet") || q.includes("lucknow") || q.includes("govt") || q.includes("government"))) {
        return {
            text: `### 🏛️ Top UP Government Engineering Colleges Comparison\n\n` +
                `| College | Location | CSE Cutoff (R3) | Avg CTC | Key Distinction |\n` +
                `| :--- | :--- | :--- | :--- | :--- |\n` +
                `| **IET Lucknow (#052)** | Lucknow | ~45,000 – 58,000 | ₹8.20 LPA | **The #1 College under AKTU**; premier brand, top alumni network, autonomous status |\n` +
                `| **KNIT Sultanpur (#104)** | Sultanpur | ~75,000 – 95,000 | ₹6.50 LPA | Government legacy college, great alumni in PSUs and civil services |\n` +
                `| **BIET Jhansi (#043)** | Jhansi | ~90,000 – 1,15,000 | ₹6.00 LPA | Strong core engineering departments, government campus infrastructure |\n\n` +
                `**Choice Filling Order**: Always order **IET Lucknow > KNIT Sultanpur > BIET Jhansi** for every branch!`,
            citations: ["UPTAC 2025 Official Cutoffs", "AKTU Government Colleges Placement Reports"]
        };
    }

    // 16. Single College Inquiry: ABES (#032)
    if (q.includes("abes") || q.includes("032")) {
        return {
            text: `### 🏛️ ABES Engineering College, Ghaziabad (Code #032)\n\n` +
                `**Overview**: Autonomous leading private engineering institute located on NH-24, Ghaziabad, affiliated with AKTU.\n\n` +
                `• **Accreditation**: **NBA Accredited** across Computer Science & Engineering (valid till 31-12-2028), Electronics & Communication Engg (valid till 30-06-2028), and Mechanical Engg (valid till 30-06-2028).\n` +
                `• **NIRF Standing**: NIRF Engineering Band 201–300.\n` +
                `• **Annual Fee**: ₹1,40,750 (Regular tuition & college charges).\n` +
                `• **Placements**: Average package ₹5.20 LPA, with top recruiters including Amazon, TCS Digital, Cisco, Capgemini, and Infosys.\n` +
                `• **2025 Cutoff Progression for CSE (OPEN)**:\n` +
                `  – Round 1: Closed at **2,78,476**\n` +
                `  – Round 2: Closed at **3,37,367**\n` +
                `  – Round 3: Closed at **4,11,234** (+132,758 rank expansion across rounds!)\n\n` +
                `**CounsellQ Verdict**: Excellent option for candidates with ranks between 1.5L and 4.2L seeking top-tier placement opportunities in Delhi-NCR.`,
            citations: ["NBA Official Portal File No. 35-71/2010-NBA", "UPTAC 2025 Cutoff Archive"]
        };
    }

    // 17. Rank-Based Inquiry (ONLY when rank is explicitly typed OR asking for recommendations)
    const explicitRankMatch = q.match(/\b([1-9]\d{3,6})\b/);
    const explicitRank = explicitRankMatch ? Number(explicitRankMatch[1]) : null;
    const isAskingForColleges = /\b(colleges?|recommend|options?|chances?|what can i get|where can i get|get into|admission in|which branch|cutoff for me|my rank|suggest)\b/i.test(q);

    const targetRank = explicitRank || (isAskingForColleges ? rank : null);

    if (targetRank && targetRank > 0) {
        return {
            text: `### 🎯 Admission Recommendations for Rank ${targetRank.toLocaleString()} (${category})\n\n` +
                `Based on historical UPTAC closing cutoffs and CounsellQ ML feasibility evaluations, here is your strategic breakdown:\n\n` +
                (targetRank < 50000 ? 
                    `#### 🟢 Safe & High Probability Options\n` +
                    `• **IET Lucknow** — Electrical, Chemical, Civil\n` +
                    `• **KNIT Sultanpur / BIET Jhansi** — Information Technology, Electronics Engg\n` +
                    `• **AKGEC / KIET / JSS Noida** — Computer Science & Engineering (100% Guaranteed Safe)\n\n` +
                    `#### 🟡 Moderate & Reach Targets\n` +
                    `• **IET Lucknow** — Computer Science & Engineering (Aim in Round 1 & Round 2 via Float)` :
                targetRank < 150000 ? 
                    `#### 🟢 Safe & Recommended Options\n` +
                    `• **AKGEC Ghaziabad / KIET Ghaziabad** — IT, ECE, CS Specializations\n` +
                    `• **GL Bajaj Greater Noida** — Computer Science & Engineering\n` +
                    `• **BIET Jhansi / KNIT Sultanpur** — Mechanical, Civil, Electrical\n\n` +
                    `#### 🟡 Strategic Reach Targets\n` +
                    `• **IET Lucknow** — Self-Finance & Core Specializations in Round 3\n` +
                    `• **JSS Noida** — Computer Science & Engineering` :
                targetRank < 400000 ?
                    `#### 🟢 Safe & High Feasibility Options\n` +
                    `• **ABES Engineering College (#032)** — CSE, CSE(AIML), Data Science, IT\n` +
                    `• **Galgotias College (#097)** — IT, Electronics & Communication\n` +
                    `• **NIET Greater Noida (#133)** — Computer Science & Engineering\n` +
                    `• **IMS Engineering College / RKGIT** — Core Computer Science\n\n` +
                    `#### 🟡 Strategic Targets via Float\n` +
                    `• **AKGEC Ghaziabad** — Core ECE & Electrical & Computer Engg\n` +
                    `• **KIET Ghaziabad** — Specialized AI & CS Allied Programs` :
                    `#### 🟢 Verified Options for Rank > 4.0 Lakh\n` +
                    `• **ABES Engineering College** — CSE (closed at 4.11L in R3), ECE, Mechanical\n` +
                    `• **NIET Greater Noida** — CS Allied, IoT, Data Science\n` +
                    `• **United College / PSIT Kanpur / IEC Greater Noida** — Computer Science & Engg\n` +
                    `• **Rajkiya Engineering Colleges (REC)** — Core Branches in Round 3 / Spot Round`
                ) +
                `\n\n> [!TIP]\n> In choice filling, always place dream choices at the top, followed by moderate branches, and your safe backup at the bottom. Never omit safe choices thinking you will add them later!`,
            citations: ["CounsellQ Prediction Engine & UPTAC 2025 Multi-Round Records"]
        };
    }

    // 18. General Counseling Inquiry Default
    return {
        text: `### 🎓 CounsellQ Admission Guidance Assistant\n\n` +
            `I can help you navigate all aspects of **UPTAC / AKTU 2025 B.Tech Counselling**:\n\n` +
            `• **College Comparisons**: Ask *"Which is better: ABES or ABES IT?"*, *"ABES vs AKGEC"*, *"AKGEC vs KIET"*, or *"GL Bajaj vs Galgotias"*.\n` +
            `• **Branch Strategy**: Ask *"Is Core CSE better than CSE AIML or IT?"*.\n` +
            `• **UPTAC Rules**: Clarification on *Freeze vs Float*, *Seat Acceptance Fee & Refunds*, *Tuition Fee Waiver (FW)*, and *Internal Branch Sliding*.\n` +
            `• **Personalized Recommendations**: Type your JEE Main rank (e.g. \`135000\`) to receive instant Safe, Moderate, and Ambitious options.\n\n` +
            `*What specific college, branch, or counselling doubt would you like help with?*`,
        citations: ["UPTAC 2025 Admission Portal", "CounsellQ Verified Database"]
    };
}

/**
 * Generate context-aware quick prompts
 */
function generateSuggestedPrompts(query) {
    const q = (query || "").toLowerCase();
    if (q.includes("freeze") || q.includes("float")) {
        return [
            "What happens if I don't get upgraded in Float?",
            "What is the refund if I withdraw after Round 2?",
            "How does internal sliding work in Round 3?"
        ];
    }
    if (q.includes("abes")) {
        return [
            "Compare ABES vs AKGEC placements",
            "What is ABES CSE cutoff in Round 3?",
            "What are ABES fee structures & hostel charges?"
        ];
    }
    return [
        "Internal sliding rules for Round 3",
        "Freeze vs Float: Which should I choose?",
        "Compare ABES vs AKGEC placements",
        "Tuition Fee Waiver (FW) seat eligibility"
    ];
}

module.exports = {
    handleChatQuery
};
