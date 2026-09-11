"use client";

import { useState } from "react";
import { SessionControl } from "../session-control";

type Language = "en" | "th";

const copy = {
  en: {
    eyebrow: "AIAT x CAMT · Lab 4",
    title: "AI system readiness backlog",
    subtitle: "Agent v3 is working. Measure, observe, and decide whether it is ready to demonstrate.",
    chat: "RAG chat", knowledge: "Knowledge base", security: "Security workbench", agent: "Agent workspace", system: "System readiness",
    warning: "This page is a Lab 4 build backlog. It is not a production release console and does not deploy, release, or monitor the product.",
    status: [
      ["Agent v3 workflow", "Working · three tools and a human approval gate"],
      ["System v4 release readiness", "Not implemented · no evaluation run and no release decision"],
      ["Public deployment", "Not required for this course"],
    ],
    inheritedLabel: "Inherited from earlier labs",
    inherited: "What already works",
    inheritedControls: [
      "RAG chat with grounded, page-level citations.",
      "Server-enforced access resolved from the signed staff session.",
      "Input, retrieval, and output controls: injection and PII refusal, role-aware access, poisoned-source quarantine, and citation validation.",
      "Bounded agent workflow with three allowlisted tools and a fixed step budget.",
      "Version-bound, one-time human approval before a local simulated result.",
      "Privacy-minimised audit records and task traces that hold fingerprints, counts, and reason codes only.",
    ],
    build: "Build in Lab 4",
    pending: "Pending",
    backlog: [
      ["Evaluation dataset and expected outcomes", "Define a small, versioned set of supported, ambiguous, unsafe, no-evidence, and approval scenarios with expected behaviour."],
      ["Evaluation runner", "Execute deterministic cases against a chosen provider or fixture mode and retain only bounded evaluation results."],
      ["Quality and evidence metrics", "Record answer and task quality notes, citation support, safe-stop behaviour, latency, error rate, and approximate cost where available."],
      ["Privacy-minimised observability", "Extend traces with operational events and aggregates without storing raw prompts, drafts, source text, model messages, secrets, or personal data."],
      ["Controlled feedback capture", "Validate, minimise, and store user quality and safety feedback through a server-owned endpoint."],
      ["Fallback and failure behaviour", "Distinguish provider, quota, and network failures from safe refusals, then use a documented local-fixture or safe-error path."],
      ["Release criteria and decision", "Create measurable thresholds, an owner, a release or no-release decision, and an honest limitation."],
      ["Product communication", "Add onboarding, empty states, error states, a feedback affordance, and clear language about system boundaries."],
      ["Evidence bundle and final demo", "Prepare an architecture diagram, an evaluation table, the release checklist, rubric evidence, and a short browser demo."],
    ],
    placeholder: "Evaluation results placeholder",
    noResults: "No evaluation dataset, measurements, or release recommendation is stored in the starter. No evaluation run and no release decision exists yet.",
    checklist: "Release-readiness checklist",
    checklistNote: "This checklist is static. Nothing on this page is scored, stored, or clickable.",
    checklistItems: [
      "Evaluation set is versioned and contains expected outcomes.",
      "Citation support is measured and meets the stated criterion.",
      "Unsafe, ambiguous, no-evidence, and provider-failure paths have been tested.",
      "Basic latency, error, and cost observations are recorded or explicitly unavailable.",
      "Logs and feedback are privacy-minimised.",
      "Fallback and user-facing failure copy are demonstrated.",
      "One product limitation is documented honestly.",
      "A named human makes the release or no-release decision.",
      "Public deployment is not required for course completion.",
    ],
    scenarios: "Static expected scenarios",
    scenariosLabel: "Future expected outcome",
    scenarioCards: [
      ["Supported task", "A user receives a grounded response or approved draft with inspectable citations.", "Evaluation records citation support, task quality notes, latency, and the safe-state outcome."],
      ["Unsafe task", "A request attempts to bypass safeguards or contains synthetic sensitive data.", "The system safely stops before unsafe tool or model use, and evaluation captures the reason code without raw content."],
      ["Provider or quota failure", "The configured model provider is unavailable or quota-limited.", "The app shows a useful failure state and uses only the documented local-fixture fallback when one is configured."],
      ["Release-blocking case", "An evaluation case lacks citation support or violates an expected safe stop.", "The release checklist stays incomplete and a human records no-release until the issue is resolved."],
    ],
    diagram: "System diagram",
    diagramNote: "No component on this starter page runs an evaluation, sends feedback, deploys the application, or approves a release.",
    scope: "Not in this starter",
    scopeItems: [
      "No POST /api/feedback route and no feedback persistence.",
      "No live evaluation runner, evaluation database, or generated dashboard metrics.",
      "No telemetry or analytics vendor SDK and no provider monitoring integration.",
      "No deployment configuration, Vercel action, public URL, or automatic release.",
      "No browser-visible provider key and no client-controlled provider choice.",
      "No fabricated passing scores, release recommendation, or evaluation history.",
    ],
    scopeNote: "Lab 4 will add evaluation and evidence carefully. The starter must not pretend this work has already happened.",
    session: { access: "Access", public: "Public", staff: "Staff", enable: "Enable staff", pin: "Staff PIN", cancel: "Cancel", logout: "Log out", submitting: "Checking…", unavailable: "Staff access is unavailable." },
  },
  th: {
    eyebrow: "AIAT x CAMT · Lab 4",
    title: "งานค้างความพร้อมของระบบ AI",
    subtitle: "Agent v3 ทำงานได้แล้ว ขั้นต่อไปคือวัดผล สังเกต และตัดสินใจว่าพร้อมสาธิตหรือไม่",
    chat: "RAG chat", knowledge: "คลังความรู้", security: "พื้นที่ทำงานความปลอดภัย", agent: "พื้นที่ทำงานเอเจนต์", system: "ความพร้อมของระบบ",
    warning: "หน้านี้คือรายการงานค้างสำหรับ Lab 4 ไม่ใช่คอนโซลปล่อยเวอร์ชันจริง และไม่ deploy ไม่ release และไม่ monitor ผลิตภัณฑ์",
    status: [
      ["เวิร์กโฟลว์ Agent v3", "ทำงานได้ · สามเครื่องมือและด่านอนุมัติจากมนุษย์"],
      ["ความพร้อมปล่อย System v4", "ยังไม่ถูก implement · ไม่มี evaluation run และไม่มีการตัดสินใจ release"],
      ["การ deploy สาธารณะ", "ไม่จำเป็นสำหรับหลักสูตรนี้"],
    ],
    inheritedLabel: "สืบทอดจากแล็บก่อนหน้า",
    inherited: "สิ่งที่ใช้งานได้แล้ว",
    inheritedControls: [
      "RAG chat พร้อม citation ระดับหน้าที่มีหลักฐานรองรับ",
      "บังคับใช้สิทธิ์จากเซิร์ฟเวอร์โดย resolve จาก signed staff session",
      "controls ด้าน input, retrieval และ output: ปฏิเสธ injection และ PII กรองตามสิทธิ์ กักกันแหล่งข้อมูลที่ถูก poison และตรวจสอบ citation",
      "เวิร์กโฟลว์เอเจนต์แบบมีขอบเขต พร้อม tool สามรายการใน allowlist และงบ step คงที่",
      "การอนุมัติจากมนุษย์ครั้งเดียวที่ผูกกับ version ก่อนผลลัพธ์จำลองในเครื่อง",
      "audit record และ task trace ที่ลดข้อมูลส่วนบุคคล เก็บเฉพาะ fingerprint จำนวน และ reason code",
    ],
    build: "สิ่งที่จะสร้างใน Lab 4",
    pending: "รอดำเนินการ",
    backlog: [
      ["ชุดข้อมูล evaluation และผลลัพธ์ที่คาดหวัง", "กำหนดชุดข้อมูลขนาดเล็กที่มี version ครอบคลุมกรณี supported, ambiguous, unsafe, no-evidence และ approval พร้อมพฤติกรรมที่คาดหวัง"],
      ["ตัวรัน evaluation", "รันเคสที่ให้ผลแน่นอนกับ provider หรือโหมด fixture ที่เลือก และเก็บเฉพาะผล evaluation ที่มีขอบเขต"],
      ["ตัวชี้วัดคุณภาพและหลักฐาน", "บันทึกคุณภาพคำตอบและงาน, citation support, พฤติกรรม safe-stop, latency, error rate และค่าใช้จ่ายโดยประมาณเมื่อมีข้อมูล"],
      ["observability ที่ลดข้อมูลส่วนบุคคล", "ขยาย trace ด้วยเหตุการณ์ปฏิบัติการและค่าสรุป โดยไม่เก็บ prompt, draft, ข้อความต้นฉบับ, ข้อความจากโมเดล, secret หรือข้อมูลส่วนบุคคล"],
      ["การเก็บ feedback อย่างควบคุม", "ตรวจสอบ ลดข้อมูล และเก็บ feedback ด้านคุณภาพและความปลอดภัยของผู้ใช้ผ่าน endpoint ที่เซิร์ฟเวอร์เป็นเจ้าของ"],
      ["พฤติกรรม fallback และความล้มเหลว", "แยกความล้มเหลวของ provider, quota และ network ออกจาก safe refusal แล้วใช้เส้นทาง local-fixture หรือ safe-error ที่มีเอกสารกำกับ"],
      ["เกณฑ์การปล่อยและการตัดสินใจ", "กำหนดเกณฑ์ที่วัดได้ เจ้าของงาน การตัดสินใจ release หรือ no-release และข้อจำกัดที่เขียนอย่างตรงไปตรงมา"],
      ["การสื่อสารกับผู้ใช้ผลิตภัณฑ์", "เพิ่ม onboarding, empty state, error state, ช่องทาง feedback และภาษาที่ชัดเจนเกี่ยวกับขอบเขตของระบบ"],
      ["ชุดหลักฐานและ demo สุดท้าย", "เตรียม architecture diagram, ตาราง evaluation, release checklist, หลักฐานตาม rubric และ demo ในเบราว์เซอร์แบบสั้น"],
    ],
    placeholder: "Evaluation results placeholder",
    noResults: "starter นี้ไม่เก็บชุดข้อมูล evaluation ผลการวัด หรือคำแนะนำการ release ใด ๆ และยังไม่มี evaluation run หรือการตัดสินใจ release",
    checklist: "รายการตรวจสอบความพร้อมก่อนปล่อย",
    checklistNote: "รายการนี้เป็นแบบคงที่ ไม่มีการให้คะแนน ไม่มีการบันทึก และคลิกไม่ได้",
    checklistItems: [
      "ชุดข้อมูล evaluation มี version และมีผลลัพธ์ที่คาดหวัง",
      "citation support ถูกวัดและผ่านเกณฑ์ที่กำหนด",
      "เส้นทาง unsafe, ambiguous, no-evidence และ provider-failure ถูกทดสอบแล้ว",
      "ค่า latency, error และ cost ขั้นพื้นฐานถูกบันทึก หรือระบุชัดว่าไม่มีข้อมูล",
      "log และ feedback ถูกลดข้อมูลส่วนบุคคลแล้ว",
      "fallback และข้อความแจ้งความล้มเหลวต่อผู้ใช้ถูกสาธิตแล้ว",
      "ข้อจำกัดของผลิตภัณฑ์หนึ่งข้อถูกเขียนไว้อย่างตรงไปตรงมา",
      "มีมนุษย์ที่ระบุชื่อได้เป็นผู้ตัดสินใจ release หรือ no-release",
      "การ deploy สาธารณะไม่จำเป็นสำหรับการจบหลักสูตร",
    ],
    scenarios: "สถานการณ์ที่คาดไว้แบบคงที่",
    scenariosLabel: "ผลลัพธ์ที่คาดหวังในอนาคต",
    scenarioCards: [
      ["งานที่รองรับได้", "ผู้ใช้ได้รับคำตอบที่มีหลักฐานหรือ draft ที่อนุมัติแล้ว พร้อม citation ที่ตรวจสอบได้", "evaluation บันทึก citation support, บันทึกคุณภาพงาน, latency และผลลัพธ์ของ safe state"],
      ["งานที่ไม่ปลอดภัย", "คำขอพยายามหลีกเลี่ยงมาตรการป้องกัน หรือมีข้อมูลอ่อนไหวสังเคราะห์", "ระบบหยุดอย่างปลอดภัยก่อนใช้ tool หรือโมเดล และ evaluation เก็บ reason code โดยไม่เก็บเนื้อหาดิบ"],
      ["provider หรือ quota ล้มเหลว", "provider ของโมเดลที่ตั้งค่าไว้ไม่พร้อมใช้งานหรือติด quota", "แอปแสดงสถานะความล้มเหลวที่ใช้งานได้ และใช้เฉพาะ local-fixture fallback ที่มีเอกสารกำกับเมื่อตั้งค่าไว้"],
      ["เคสที่บล็อกการปล่อย", "เคส evaluation ขาด citation support หรือฝ่าฝืน safe stop ที่คาดหวัง", "release checklist ยังไม่ครบ และมนุษย์บันทึก no-release จนกว่าจะแก้ไข"],
    ],
    diagram: "System diagram",
    diagramNote: "ไม่มีส่วนใดในหน้านี้ที่รัน evaluation ส่ง feedback deploy แอป หรืออนุมัติ release",
    scope: "ไม่อยู่ใน starter นี้",
    scopeItems: [
      "ไม่มี route POST /api/feedback และไม่มีการเก็บ feedback",
      "ไม่มี evaluation runner จริง ไม่มีฐานข้อมูล evaluation และไม่มีตัวชี้วัดที่สร้างขึ้นบน dashboard",
      "ไม่มี SDK ของ telemetry หรือ analytics และไม่มีการเชื่อมต่อ monitoring ของ provider",
      "ไม่มี config การ deploy ไม่มี action บน Vercel ไม่มี public URL และไม่มีการ release อัตโนมัติ",
      "ไม่มี provider key ที่มองเห็นได้จากเบราว์เซอร์ และให้ client เลือก provider เองไม่ได้",
      "ไม่มีคะแนนผ่านที่กุขึ้น คำแนะนำ release หรือประวัติ evaluation",
    ],
    scopeNote: "Lab 4 จะเพิ่ม evaluation และหลักฐานอย่างรอบคอบ starter นี้ต้องไม่แสร้งว่างานนั้นเสร็จแล้ว",
    session: { access: "สิทธิ์", public: "สาธารณะ", staff: "เจ้าหน้าที่", enable: "เปิดใช้ staff", pin: "Staff PIN", cancel: "ยกเลิก", logout: "ออกจากระบบ", submitting: "กำลังตรวจสอบ…", unavailable: "ไม่สามารถเปิดใช้ staff ได้" },
  },
} as const;

export default function SystemPage() {
  const [language, setLanguage] = useState<Language>("en");
  const text = copy[language];

  return <main className="lab">
    <header className="hero"><div><p className="eyebrow">{text.eyebrow}</p><h1>{text.title}</h1><p className="subtitle">{text.subtitle}</p></div><div className="header-actions"><nav><a href="/">{text.chat}</a><a href="/knowledge">{text.knowledge}</a><a href="/security">{text.security}</a><a href="/agent">{text.agent}</a><a href="/system" aria-current="page">{text.system}</a></nav><SessionControl labels={text.session} /><div className="language" aria-label="Language"><button className={language === "en" ? "selected" : ""} onClick={() => setLanguage("en")}>EN</button><button className={language === "th" ? "selected" : ""} onClick={() => setLanguage("th")}>ไทย</button></div></div></header>
    <p className="warning" role="alert">{text.warning}</p>

    <section className="state-strip">{text.status.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>

    <section className="security-grid"><section className="todo-list"><p className="eyebrow">{text.inheritedLabel}</p><h2>{text.inherited}</h2><ul>{text.inheritedControls.map((item) => <li key={item}>{item}</li>)}</ul></section><section className="todo-list"><p className="eyebrow">Lab 4</p><h2>{text.build}</h2><ol className="backlog-list">{text.backlog.map(([title, detail]) => <li key={title}><strong>{title}</strong><span>{detail}</span><b className="status ambiguous">{text.pending}</b></li>)}</ol></section></section>

    <section className="audit-card agent-table"><p className="eyebrow">{text.placeholder}</p><h2>{text.placeholder}</h2><div className="table-wrap"><table><caption className="sr-only">{text.placeholder}</caption><thead><tr><th>caseId</th><th>expectedOutcome</th><th>citationSupport</th><th>safeStop</th><th>latencyMs</th><th>estimatedCost</th><th>releaseImpact</th></tr></thead><tbody><tr><td colSpan={7}>{text.noResults}</td></tr></tbody></table></div></section>

    <section className="security-grid"><section className="todo-list"><p className="eyebrow">Lab 4</p><h2>{text.checklist}</h2><p className="checklist-note">{text.checklistNote}</p><ul className="checklist">{text.checklistItems.map((item) => <li key={item}>{item}</li>)}</ul></section><section className="todo-list"><p className="eyebrow">Boundary</p><h2>{text.scope}</h2><ul>{text.scopeItems.map((item) => <li key={item}>{item}</li>)}</ul><p className="workflow-note">{text.scopeNote}</p></section></section>

    <section className="scenario-list"><p className="eyebrow">Lab 4</p><h2>{text.scenarios}</h2><div className="scenario-grid">{text.scenarioCards.map(([name, prompt, outcome]) => <article className="scenario-card" key={name}><h3>{name}</h3><p>{prompt}</p><strong>{text.scenariosLabel}</strong><p>{outcome}</p></article>)}</div></section>

    <section className="security-grid"><section className="todo-list"><p className="eyebrow">Lab 4</p><h2>{text.diagram}</h2><pre className="workflow">{`user
  -> browser UI and feedback affordance
  -> server: session, policy, authorization, retrieval, validation
  -> approved knowledge base
  -> bounded agent workflow and human approval gate
  -> model provider OR documented local fixture fallback
  -> privacy-minimised trace and evaluation summaries
  -> human release decision`}</pre><p className="workflow-note">{text.diagramNote}</p></section></section>
  </main>;
}
