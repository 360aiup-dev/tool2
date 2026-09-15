import React, { useState, useRef } from "react";
import { marked } from "marked";
import {
  Sparkles,
  Zap,
  Printer,
  Bot,
  AlertTriangle,
  Lightbulb,
  Check,
  Cpu,
  RefreshCw,
} from "lucide-react";
import type { IndustryType, CompanySizeType } from "../types";

export const AiRiskScreening: React.FC = () => {
  const [industry, setIndustry] = useState<IndustryType>("製造業");
  const [size, setSize] = useState<CompanySizeType>("5-30人");
  const [issue, setIssue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reportMarkdown, setReportMarkdown] = useState<string>("");
  const [renderedHtml, setRenderedHtml] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [reportType, setReportType] = useState<
    "preset" | "real_ai" | "quota" | "guidance" | "strategic_engine"
  >("real_ai");
  const [modelEngineInfo, setModelEngineInfo] = useState<{ model: string; isDegraded: boolean } | null>(null);

  const resultContainerRef = useRef<HTMLDivElement>(null);

  // Dynamically resolve backend API endpoints across GitHub Pages and Cloud Run
  const getCandidateApiUrls = (path: string): string[] => {
    const urls: string[] = [];
    const metaEnv = (import.meta as any).env || {};
    const custom = metaEnv.VITE_API_URL || metaEnv.VITE_BACKEND_URL;
    if (custom && typeof custom === "string" && custom.startsWith("http")) {
      urls.push(`${custom.replace(/\/+$/, "")}${path}`);
    }

    const isGitHubPages =
      typeof window !== "undefined" &&
      (window.location.hostname.includes("github.io") ||
        window.location.hostname.includes("localhost") === false &&
        !window.location.hostname.includes("run.app"));

    if (isGitHubPages) {
      // Prioritize the live active production Cloud Run backend
      urls.push(`https://ais-pre-rdsmd6k3mwl3urmcbod3im-581991009233.asia-east1.run.app${path}`);
      urls.push(`https://ais-dev-rdsmd6k3mwl3urmcbod3im-581991009233.asia-east1.run.app${path}`);
    }

    // Relative endpoint (default for local dev and direct Cloud Run)
    urls.push(path);

    if (!isGitHubPages) {
      urls.push(`https://ais-pre-rdsmd6k3mwl3urmcbod3im-581991009233.asia-east1.run.app${path}`);
    }

    return Array.from(new Set(urls));
  };

  // Quick Preset Issue Templates
  const presets = [
    {
      title: "出勤與加班",
      text: "員工下班後經常在 Line 詢問工作或回覆訊息，想知道如何合法規範出勤紀錄與加班費計算，避免被勞檢認定隱形加班違規裁罰？",
    },
    {
      title: "薪資結構優化",
      text: "基本工資逐年調漲，目前給員工全薪45,000元，希望合法拆分經常性與非經常性項目（如津貼、伙食費、績效獎金），降低勞健保負擔與加班費基數？",
    },
    {
      title: "不適任員工退場",
      text: "有位員工試用期過後工作態度消極、常遲到且工作錯誤率高，多次口頭勸導無效，公司該如何落實合法輔導SOP與資遣程序？",
    },
    {
      title: "醫療/輪班排班",
      text: "單位涉及輪班與值班，排班表常超出正常工時，如何合法實施變形工時、簽署同意書並召開勞資會議？",
    },
    {
      title: "業務離職帶走客戶",
      text: "業務主管離職跳槽到競爭對手，私下透過通訊軟體帶走核心客戶名單與重要報價資訊，公司如何透過競業禁止與營業秘密法維護權益？",
    },
  ];

  const QUOTA_EXHAUSTED_CLIENT_MESSAGE = `# ⚠️ 今日AI額度已使用完畢...

抱歉，由於目前系統線上諮詢量踴躍，**今日AI額度已使用完畢...**

系統目前暫時無法為您的自訂情境進行即時全新 AI 運算分析。

### 建議您採取以下方案：
1. **體驗固定快選範例**：您可以點選左側「常見情境快速填入」的固定快選按鈕（如：出勤與加班、薪資結構優化、不適任員工退場、業務離職帶走客戶等），立即查閱由策略人資總監親自精編的完整法規防火牆與戰略實戰示範報告。
2. **預約策略人資顧問深度諮詢**：若您目前正面臨急迫之勞資爭議、員工檢舉、大量資遣、高額求償或營業秘密外洩，建議直接聯繫頭家神隊友顧問團隊進行一對一深度對談：
   - **顧問專線**：0923-869696 許顧問
   - **官方 LINE 預約**：[https://lin.ee/udQp9wm](https://lin.ee/udQp9wm)
   - **聯絡 Email**：360.aiup@gmail.com`;

  const isIrrelevantIssue = (iss: string): boolean => {
    const trimmed = iss.trim();
    if (trimmed.length < 3) return true;
    const normalized = trimmed.toLowerCase();
    const irrelevantPatterns = [
      /^肚子[餓饿]/,
      /^[餓饿]了?$/,
      /^[想好]睡(覺|觉)?$/,
      /^[好超很]累$/,
      /^(早安|午安|晚安|你好|您好|哈囉|hello|hi|hey|嗨)$/,
      /^(測試|test|testing|123|1234|abc)$/,
      /^(吃(飯|麵|飯了嗎|飽沒|什麼)|午餐|早餐|晚餐)$/,
      /^(天氣|好熱|好冷|下雨)$/,
      /^(你是誰|什麼名字|人工智慧|chatgpt)$/
    ];
    return irrelevantPatterns.some((p) => p.test(normalized));
  };

  const getBaselineDiagnosisReport = (ind: string, sz: string, iss: string) => {
    const text = iss.toLowerCase();

    // Check for irrelevant non-HR inputs (e.g. "肚子餓")
    if (isIrrelevantIssue(iss)) {
      return `# ⚠️ 勞資戰略快篩提示

您輸入的內容（「${iss}」）並非企業經營管理、勞動法令或人力資源之相關情境。

**【本快篩專為企業主與主管診斷以下核心領域】：**
1. **工時與出勤**：排班調移、打卡紀錄、加班費計算爭議、下班後通訊軟體交辦
2. **勞動契約與退場**：試用期考核標準、不適任資遣、懲戒解僱、PIP 輔導、合意離職協議
3. **商業資產防禦**：離職挖角、客戶名單帶走、營業秘密外洩、競業禁止條款
4. **薪資結構與福利**：底薪與獎金科目重組、高薪低報避險、二代健保與勞退合規
5. **勞檢與爭議處理**：勞工局勞動檢查應對、勞資爭議調解、職場霸凌與性騷擾防治

👉 **請在上方輸入框具體描述您目前面臨的團隊或制度痛點**（例如：「員工試用期表現不佳想請他離開，如何避免違法資遣？」或「業務主管離職跳槽競品並私下挖角團隊」），策略人資總監將為您進行深入的法律防火牆檢視與落地方案。`;
    }

    // Scenario 1: Trade secrets, customer poaching, non-compete
    if (
      text.includes("秘密") ||
      text.includes("客戶") ||
      text.includes("競業") ||
      text.includes("跳槽") ||
      text.includes("挖角") ||
      text.includes("帶走") ||
      text.includes("外洩")
    ) {
      return `# 企業勞資戰略診斷報告

### 1. 現況剖析與商業打擊
貴司（${ind}，規模約 ${sz}）所遇情境：「${iss.slice(0, 50)}...」
這絕非單純的人事流動，而是**「企業核心商業資產的非法掠奪」**。
- **利潤與營運衝擊**：客戶名單與核心機密外洩，將直接導致既有合約遭競品低價狙擊，客戶獲取成本 (CAC) 成倍翻升。若團隊關鍵技術人員遭成批挖角，更將導致服務鏈中斷，直接侵蝕企業核心毛利。
- **管理漏洞盲點**：多數中小企業誤以為簽署一般僱傭合約即具防禦力，實務上常因「未落實合理保密措施」或「競業禁止未依法提供合理補償」，導致訴訟時在法庭上遭法官全盤宣告無效。

### 2. 風險評級
**極高風險 (Critical)**

### 3. 法律防火牆與違規/求償清單

| 法源依據 | 侵害或違法樣態 | 預估財務損害 / 法律責任追訴 |
| :--- | :--- | :--- |
| **營業秘密法第10條、第12條、第13條之1** | 未經授權複製、帶走客戶名單、報價參數或技術配方 | 民事最高3倍懲罰性賠償金；刑事處 5 年以下有期徒刑或併科 NT$ 100萬 ～ 5,000萬元罰金 |
| **勞動基準法第9條之1 (競業禁止四要件)** | 離職競業禁止未給付每月至少半薪之合理補償費 | 條款自始無效，公司無權限制員工跳槽，已投入之防禦成本全盤落空 |
| **民法第184條、第544條及刑法第342條** | 受任人違背任務致公司受損害 (背信罪) | 追訴背信罪刑責，並得依法假扣押其名下財產追索損害賠償 |

### 4. 策略總監實戰方案 (Action Plan)
- **第一時間保全電子證據鏈 (Forensic)**：立即盤查其公用筆電、企業信箱及雲端空間之最後存取/轉寄紀錄，進行數位鑑識存證，為日後假處分做足準備。
- **寄發正式存證信函與律師警告函**：同步發函給該離職員工與新任競品公司，正式主張著作權與營業秘密權益，啟動法律威嚇阻斷對手繼續接收被竊資料。
- **升級機密資訊分級與權限控管 (ACL)**：對公司既有客戶資料庫實施「權限分級」與「下載浮水印」，在法律層面補強「合理保密措施」之法定抗辯要件。
- **重新檢視競業禁止與補償條款**：針對高階與關鍵職位，嚴格按勞基法施行細則重簽附帶合法補償金之保密競業契約，築起牢不可破的制度護城河。

### 5. 總監策略心法
**「營業秘密的防禦，贏在事前權限隔離，而非事後法庭叫屈。」** 當制度具備實質威懾力，野心者才不敢拿公司的命脈作為個人投名的籌碼。

*提示：請務必諮詢勞動法與智慧財產權專業顧問以確保合規*`;
    }

    // Scenario 2: Termination, layoff, PIP, probation, severance
    if (
      text.includes("資遣") ||
      text.includes("解僱") ||
      text.includes("開除") ||
      text.includes("不適任") ||
      text.includes("試用期") ||
      text.includes("退場") ||
      text.includes("淘汰") ||
      text.includes("自願離職")
    ) {
      return `# 企業勞資戰略診斷報告

### 1. 現況剖析與商業打擊
貴司（${ind}，規模約 ${sz}）所遇情境：「${iss.slice(0, 50)}...」
處理不適任員工退場，是企業經營者最耗心力、也最容易踩雷的關卡。
- **營運與財務傷害**：一旦退場程序產生瑕疵，遭員工提起「確認僱傭關係存在」訴訟，官司動輒纏訟 1～3 年。敗訴時雇主須**全額補發爭訟期間工資加計年息 5%**，並強制復職，財務打擊動輒百萬起跳。
- **組織文化侵蝕**：留下不適任員工會拖垮高效同仁產能；但若「粗暴開除」則引發全員自危，破壞組織的人才密度與信任基礎。

### 2. 風險評級
**高度風險**

### 3. 法律防火牆與違法裁罰清單

| 法源依據 | 潛在違規行為 | 預估財務風險/罰鍰 |
| :--- | :--- | :--- |
| **勞基法第11條第5款、最高法院判決** | 未落實「解僱最後手段性原則」即逕行終止契約 | 判決解僱無效，補發爭訟全期工資 (通常 NT$ 60萬 ～ 150萬以上) 且須復職 |
| **勞基法第12條第1項第4款及第2項** | 懲戒解僱逾越 30 日法定知悉除斥期間 | 解僱無效，轉為違法終止，面臨重額補發工資訴求 |
| **就業服務法第33條第1項** | 資遣員工未於離職 10 日前向主管機關辦理資遣通報 | 依就服法第68條第1項，處 NT$ 3萬 ～ 15萬元罰鍰 |
| **勞基法第16條、第17條 / 勞工退休金條例第12條** | 未依法給付預告工資或資遣費 | 處 NT$ 30萬 ～ 150萬元罰鍰，並限期給付 |

### 4. 策略總監實戰方案 (Action Plan)
- **實施標準化績效改善計畫 (PIP)**：建立至少 30～60 天之 PIP，明確定義改善目標、輔導紀錄、雙方簽名週會面談，完備合規舉證最後手段性。
- **善用合意終止協議 (Mutual Separation Agreement)**：以「離職金協議 (Severance Package)」換取勞工自願簽署保密與拋棄爭議權利條款，斬斷一切訴訟後患。
- **嚴守 10 日資遣通報與法定預告日程**：確保人資系統在預告期與資遣通報時程上零瑕疵，防杜勞工局開罰。
- **重新檢視試用期考核標準**：試用期雖具契約彈性，退場仍須符合具體客觀之職能考核記錄，杜絕無由終止爭議。

### 5. 總監策略心法
**「好人才需要尊重，不適任人才需要流程。」** 透過制度化留痕與善意溝通，才能兼顧法規防禦與企業管理尊嚴。

*提示：請務必諮詢當地勞動法律顧問以確保合規*`;
    }

    // Scenario 3: Overtime, attendance, Line messages off-hours, scheduling
    if (
      text.includes("加班") ||
      text.includes("排班") ||
      text.includes("調班") ||
      text.includes("打卡") ||
      text.includes("出勤") ||
      text.includes("工時") ||
      text.includes("超時") ||
      text.includes("line") ||
      text.includes("休假") ||
      text.includes("請假")
    ) {
      return `# 企業勞資戰略診斷報告

### 1. 現況剖析與商業打擊
貴司（${ind}，規模約 ${sz}）所遇情境：「${iss.slice(0, 50)}...」
出勤紀錄與排班混亂，是台灣勞檢處開罰率最高的頭號地雷。
- **營運利潤侵蝕**：排班若與打卡記錄脫鉤，會引發「加班費隱形膨脹」或「漏給加班費」之連鎖追討風險，離職員工可回溯追索 5 年差額。
- **隱形加班陷阱**：主管下班後以通訊軟體交辦事項，若無「加班事前申請與離線原則規範」，在司法與勞檢實務上一律依通訊時間推定為加班工時。

### 2. 風險評級
**高度風險**

### 3. 法律防火牆與違規裁罰清單

| 法源依據 | 潛在違規行為 | 預估財務風險/罰鍰 |
| :--- | :--- | :--- |
| **勞基法第30條第5項、第6項** | 未備置出勤紀錄，或記錄未詳實載至分鐘 (如僅勾選打勾) | 依勞基法第79條第2項，處 NT$ 9萬 ～ 45萬元罰鍰 |
| **勞基法第24條、第39條** | 未依法加乘發給平日加班費 (1.34/1.67倍) 或國定假日加倍發給工資 | 處 NT$ 2萬 ～ 100萬元罰鍰，並公布企業名稱與負責人姓名 |
| **勞基法第32條第2項** | 延長工時每日超過 12 小時或每月超逾 46 小時上限 | 處 NT$ 2萬 ～ 100萬元罰鍰 |
| **勞基法第36條** | 勞工每 7 日中未有 1 日例假、1 日休息日 (違反一例一休) | 處 NT$ 2萬 ～ 100萬元罰鍰 |

### 4. 策略總監實戰方案 (Action Plan)
- **導入合法工時制度 (變形工時調移)**：依產業特性依法召開勞資會議通過二週、四週或八週變形工時，將工時排程合法彈性化，省下高額無謂加班費。
- **訂立「離線權」與「通訊軟體交辦守則」**：明訂下班後非緊急事項不回覆原則，若確有緊急交辦，落實事後「分鐘級補登打卡」審批，消除隱形勞檢地雷。
- **全面升級雲端 GPS/數位打卡系統**：廢除紙本紀錄，確保出勤、請假與薪資系統自動連動，確保帳表一致。
- **定期召開每季勞資會議並報備備查**：健全勞資會議機制，使加班、輪班換班間隔等法定彈性具備堅不可摧的程序正義。

### 5. 總監策略心法
**「在出勤紀錄上省麻煩，就是給勞檢員與離職員工送上空白支票。」** 嚴格的數位打卡紀錄是保護雇主最根本的法律盾牌。

*提示：請務必諮詢當地勞動法律顧問以確保合規*`;
    }

    // Default: Professional Strategic HRBP Assessment
    return `# 企業勞資戰略診斷報告

### 1. 現況剖析與管理評估
貴司（${ind}，規模約 ${sz}）所諮詢情境：「${iss.slice(0, 50)}...」
在企業組織管理與勞動法規實務中，此類情境需特別釐清**「契約約定範圍」、「管理指揮權界限」與「法定程序完備度」**。
- **經營與管理影響**：若缺乏清晰的內部書面約定或標準作業程序（SOP），往往在團隊內部發生認知分歧時演變為勞資對立，甚至可能衍生非預期的調解或行政爭議。
- **合規管理盲點**：部分企業常仰賴口頭默契或慣例處理，但在勞動檢查或司法實務上，主管機關多採「書面證據原則」與「有利勞工推定原則」，事前制度化留痕方為防禦根本。

### 2. 風險評級
**中度至高度風險 (視書面舉證完整度而定)**

### 3. 法律防火牆與法規檢視重點

| 法源依據 | 實務檢視重點 | 潛在爭議與法律責任 |
| :--- | :--- | :--- |
| **勞基法第70條 / 工作規則** | 內部規章是否報主管機關核備並公開揭示 | 罰鍰 NT$ 2萬 ～ 30萬元，未公開揭示者條款效力恐受爭執 |
| **勞基法第22條 / 工資全額給付原則** | 是否有因違規私自扣薪或未全額給付情形 | 罰鍰 NT$ 9萬 ～ 45萬元，並令限期給付差額工資 |
| **勞動事件法第37條 / 舉證責任倒置** | 公司是否備妥出勤、工資、輔導或面談之書面留痕 | 勞動法庭上雇主負實質舉證之責，無留痕將面臨舉證不利益 |

### 4. 策略總監實戰方案 (Action Plan)
- **盤點合約條款與管理留痕**：檢視現行勞動契約與相關規章，確保雙方權利義務具備書面合意與清楚界定。
- **建立標準化溝通與簽核流程**：將口頭管理升級為具有法律效力的表單、會議紀錄或定期考核，確保程序正義。
- **定期召開勞資會議**：透過合法勞資會議形成決議，確保企業內部管理彈性獲得法制化保障。
- **諮詢專業顧問專案體檢**：針對爭議疑慮進行個案法規審查，在爭議升級前完成合規防禦閉環。

### 5. 總監策略心法
**「制度不是束縛管理的枷鎖，而是保護企業基業長青的護城河。」** 釐清界限、留痕合法，才能在專注衝刺業務時無後顧之憂。

*提示：請務必諮詢當地勞動法律顧問以確保合規*`;
  };

  const handleRunDiagnosis = async () => {
    if (!issue.trim()) {
      setErrorMessage("請輸入您的管理痛點或疑問。");
      return;
    }

    setErrorMessage("");

    const trimmedIssue = issue.trim();

    // 1. Check if user selected one of the fixed presets ("固定快選")
    const matchedPreset = presets.find(
      (p) => p.text.trim() === trimmedIssue || trimmedIssue.includes(p.text.trim())
    );

    if (matchedPreset) {
      setIsLoading(true);
      setReportMarkdown("");
      setRenderedHtml("");
      // For fixed preset, show the curated strategic showcase report without burning API quota
      const reportText = getBaselineDiagnosisReport(industry, size, matchedPreset.text);
      setReportType("preset");
      setReportMarkdown(reportText);
      const parsed = await marked.parse(reportText);
      setRenderedHtml(parsed);
      setIsLoading(false);

      try {
        localStorage.setItem(
          "last_diagnosis_data",
          JSON.stringify({
            industry,
            size,
            issue: trimmedIssue,
            aiResult: reportText,
          })
        );
      } catch (e) {
        // ignore storage quota
      }

      if (window.innerWidth < 768 && resultContainerRef.current) {
        resultContainerRef.current.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    // 2. Check if input is completely irrelevant (e.g. "肚子餓")
    if (isIrrelevantIssue(trimmedIssue)) {
      setIsLoading(true);
      setReportMarkdown("");
      setRenderedHtml("");
      const guidance = getBaselineDiagnosisReport(industry, size, trimmedIssue);
      setReportType("guidance");
      setReportMarkdown(guidance);
      const parsed = await marked.parse(guidance);
      setRenderedHtml(parsed);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setReportMarkdown("");
    setRenderedHtml("");

    // 3. For custom inputs: Real AI diagnosis with multi-endpoint & automatic fallback!
    try {
      const payload = {
        industry,
        size,
        issue: trimmedIssue,
      };

      let reportText = "";
      let modelUsedName = "";
      let isDegradedModel = false;
      let isRealAiSuccess = false;

      // Try endpoints sequentially: Cloud Run backend (for GitHub Pages), custom URL, and relative API
      const candidateEndpoints = getCandidateApiUrls("/api/diagnose");

      for (const endpoint of candidateEndpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 14000);

          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.report && !data.quotaExceeded) {
              reportText = data.report;
              modelUsedName = data.modelUsed || "Gemini Flash";
              isDegradedModel = Boolean(data.isDegraded);
              isRealAiSuccess = true;
              break;
            }
          }
        } catch (endpointErr) {
          console.warn(`[AI Diagnosis] Endpoint ${endpoint} attempt failed:`, endpointErr);
          // Continue to next endpoint or fallback
        }
      }

      if (isRealAiSuccess && reportText) {
        setReportType("real_ai");
        setModelEngineInfo({
          model: modelUsedName,
          isDegraded: isDegradedModel,
        });
      } else {
        // Fall back gracefully to the comprehensive Strategic Decision Model
        // This ensures GitHub Pages or offline users NEVER face false quota exhaustion!
        reportText = getBaselineDiagnosisReport(industry, size, trimmedIssue);
        setReportType("strategic_engine");
        setModelEngineInfo({
          model: "策略人資總監實戰決策模型",
          isDegraded: true,
        });
      }

      setReportMarkdown(reportText);
      const parsed = await marked.parse(reportText);
      setRenderedHtml(parsed);

      try {
        localStorage.setItem(
          "last_diagnosis_data",
          JSON.stringify({
            industry,
            size,
            issue: trimmedIssue,
            aiResult: reportText,
          })
        );
      } catch (e) {
        // ignore storage quota
      }

      // Scroll result into view on mobile
      if (window.innerWidth < 768 && resultContainerRef.current) {
        resultContainerRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err: any) {
      console.error("Diagnosis error:", err);
      // Fallback directly to strategic report on any unexpected runtime error
      const fallbackReport = getBaselineDiagnosisReport(industry, size, trimmedIssue);
      setReportType("strategic_engine");
      setReportMarkdown(fallbackReport);
      const parsed = await marked.parse(fallbackReport);
      setRenderedHtml(parsed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRunDiagnosis();
  };

  const handleCopyReport = () => {
    if (!reportMarkdown) return;
    navigator.clipboard.writeText(reportMarkdown);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const printReport = () => {
    if (!renderedHtml) return;

    const disclaimerText =
      "【AI 診斷免責聲明】本報告由 AI 自動生成，僅供參考，不代表正式法律意見書。具體個案請以最新勞動法令、法院判決及專業律師、顧問團隊之書面意見為準。";

    const printHtml = `
      <!DOCTYPE html>
      <html lang="zh-TW">
      <head>
        <meta charset="UTF-8">
        <title>企業勞資戰略診斷報告 - 策略人資總監觀點</title>
        <style>
          @page { margin: 2cm 1.5cm 2.5cm 1.5cm; size: A4; }
          body { font-family: 'Noto Sans TC', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b; padding-bottom: 50px; }
          .report-header { border-bottom: 3px solid #F59E0B; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          .report-title { color: #0f172a; font-size: 26px; font-weight: 800; margin: 0 0 4px 0; }
          .report-subtitle { color: #d97706; font-size: 14px; font-weight: 700; margin: 0; }
          .contact-box { text-align: right; font-size: 13px; color: #475569; line-height: 1.4; }
          .info-box { margin: 20px 0 25px 0; padding: 16px 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; page-break-inside: avoid; }
          .info-title { font-weight: 700; color: #0f172a; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; font-size: 15px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13.5px; }
          .info-full { grid-column: span 2; margin-top: 4px; }
          h1 { font-size: 20px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 24px; }
          h2, h3 { color: #0f172a; margin-top: 1.4em; border-left: 4px solid #F59E0B; padding-left: 10px; font-size: 16px; }
          table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px; page-break-inside: avoid; }
          th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
          th { background: #f1f5f9; color: #1e293b; font-weight: 700; }
          td:last-child { color: #dc2626; font-weight: 600; }
          strong { color: #b45309; }
          ul { padding-left: 20px; margin: 10px 0; }
          li { margin-bottom: 6px; font-size: 14px; }
          p { margin-bottom: 12px; font-size: 14px; }
          #print-footer { position: fixed; bottom: 0; left: 0; width: 100%; background: white; padding-top: 8px; border-top: 1px solid #cbd5e1; font-size: 11px; color: #64748b; line-height: 1.4; }
          .disclaimer-bold { font-weight: 600; display: block; margin-bottom: 2px; color: #475569; }
        </style>
      </head>
      <body>
        <div class="report-header">
          <div>
            <div class="report-title">企業勞資戰略診斷報告</div>
            <div class="report-subtitle">策略人資總監 (Strategic HRBP) 觀點 ｜ 頭家神隊友顧問團隊</div>
          </div>
          <div class="contact-box">
            <div><strong>諮詢專線：</strong>0923-869696 許顧問</div>
            <div><strong>E-mail：</strong>360.aiup@gmail.com</div>
            <div><strong>診斷日期：</strong>${new Date().toLocaleDateString("zh-TW")}</div>
          </div>
        </div>

        <div class="info-box">
          <div class="info-title">📋 諮詢企業背景資訊</div>
          <div class="info-grid">
            <div><strong>所屬行業：</strong>${industry}</div>
            <div><strong>公司規模：</strong>${size}</div>
            <div class="info-full"><strong>管理痛點／疑問：</strong><br>${issue.replace(
              /\n/g,
              "<br>"
            )}</div>
          </div>
        </div>

        <div class="report-body">
          ${renderedHtml}
        </div>

        <div id="print-footer">
          <span class="disclaimer-bold">${disclaimerText}</span>
          頭家神隊友顧問團隊 &copy; 2026 All rights reserved. ｜ 預約實體深度診斷請洽 0923-869696
        </div>
      </body>
      </html>
    `;

    // Try hidden iframe approach first (iframe-safe and never blocked by popup blockers)
    try {
      const hiddenIframe = document.createElement("iframe");
      hiddenIframe.style.position = "fixed";
      hiddenIframe.style.right = "0";
      hiddenIframe.style.bottom = "0";
      hiddenIframe.style.width = "0";
      hiddenIframe.style.height = "0";
      hiddenIframe.style.border = "none";
      hiddenIframe.style.visibility = "hidden";
      document.body.appendChild(hiddenIframe);

      const frameDoc = hiddenIframe.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(printHtml);
        frameDoc.close();
        setTimeout(() => {
          try {
            hiddenIframe.contentWindow?.focus();
            hiddenIframe.contentWindow?.print();
          } catch (e) {
            console.error("Iframe print error:", e);
          } finally {
            setTimeout(() => {
              if (document.body.contains(hiddenIframe)) {
                document.body.removeChild(hiddenIframe);
              }
            }, 1500);
          }
        }, 500);
        return;
      }
    } catch (err) {
      console.warn("Iframe print not supported, falling back to window.open", err);
    }

    // Fallback: window.open without alert popup
    try {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(printHtml);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 600);
      }
    } catch (e) {
      console.error("Window print error:", e);
    }
  };

  return (
    <section
      id="ai-tool"
      className="py-20 md:py-28 bg-slate-900 relative overflow-hidden border-b border-slate-800 bg-texture"
    >
      {/* Background imagery */}
      <div
        className="absolute inset-0 opacity-80 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000')",
        }}
      />
      <div className="absolute inset-0 bg-slate-950/85" />
      <div className="glow-effect top-0 left-0 transform -translate-x-1/4 -translate-y-1/4 opacity-40" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full mb-3 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>20 年 Fortune 500 策略人資總監觀點</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-shadow-lg">
            AI 企業勞資戰略風險快篩
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-base">
            以 Strategic HRBP 與經營者視角出發，將法規遵循轉化為商業競爭力，快速檢視潛在財務罰鍰與關鍵行動計畫
          </p>
        </div>

        <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col md:flex-row min-h-[580px]">
          {/* Left: Input Form */}
          <div className="w-full md:w-5/12 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-700 flex flex-col justify-between">
            <form id="ai-form" onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-slate-300 text-sm font-bold mb-2">
                  所屬行業
                </label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value as IndustryType)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-amber-400 outline-none transition"
                >
                  <option value="製造業">製造業</option>
                  <option value="餐飲服務業">餐飲服務業</option>
                  <option value="零售業">零售業</option>
                  <option value="醫療院所">醫療院所</option>
                  <option value="長照機構">長照機構</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-bold mb-2">
                  公司規模
                </label>
                <select
                  id="size"
                  value={size}
                  onChange={(e) => setSize(e.target.value as CompanySizeType)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-amber-400 outline-none transition"
                >
                  <option value="5人以下">5人以下（微型企業）</option>
                  <option value="5-30人">5-30人（中小型企業）</option>
                  <option value="31-100人">31-100人（成長型企業）</option>
                  <option value="100人以上">100人以上（大型企業）</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-slate-300 text-sm font-bold">
                    管理痛點 / 疑問
                  </label>
                  <span className="text-xs text-slate-400">具體描述利於精準診斷</span>
                </div>
                <textarea
                  id="issue"
                  rows={4}
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-amber-400 outline-none transition placeholder-slate-500 text-sm leading-relaxed"
                  placeholder="例如：員工經常遲到、想合法優化薪資結構、不適任員工處置程序、工時與加班費計算爭議..."
                />
              </div>

              {/* Quick Presets */}
              <div>
                <span className="block text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
                  <span className="flex items-center">
                    <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-400" />
                    常見情境固定快選（免消耗 AI 額度）：
                  </span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p, idx) => {
                    const isSelected = issue.trim() === p.text.trim();
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setIssue(p.text)}
                        className={`text-xs px-2.5 py-1 rounded border transition ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-500 text-amber-300 font-semibold"
                            : "bg-slate-900/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border-slate-700"
                        }`}
                      >
                        {p.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-xs flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-lg flex items-center justify-center transition shadow-lg active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <Zap className="w-5 h-5 mr-2 text-amber-400" />
                {isLoading ? "AI 診斷分析中..." : "開始 AI 診斷"}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center text-slate-300">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                2026 最新法規標準・策略人資總監觀點即時快篩
              </span>
              <span className="text-slate-400 hidden sm:inline">
                支援 A4 列印與專屬深度診斷
              </span>
            </div>
          </div>

          {/* Right: Diagnostic Output Container */}
          <div
            ref={resultContainerRef}
            className="w-full md:w-7/12 p-6 sm:p-8 bg-slate-950/70 flex flex-col relative justify-between"
          >
            {/* Placeholder state */}
            {!isLoading && !renderedHtml && (
              <div
                id="result-placeholder"
                className="m-auto text-slate-400 text-center py-12"
              >
                <Bot className="w-16 h-16 mx-auto mb-4 text-slate-600 opacity-60" />
                <p className="text-base font-medium text-slate-300">
                  分析結果將顯示於此
                </p>
                <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                  請在左側選擇行業、規模並填寫所遇痛點，點擊「開始 AI 診斷」
                </p>
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div
                id="loading-state"
                className="flex flex-col items-center justify-center h-full text-center py-16"
              >
                <div className="typing-indicator mb-4">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p className="text-amber-400 text-sm font-medium animate-pulse">
                  正在精準對接法令規範與勞檢標準...
                </p>
                <p className="text-slate-500 text-xs mt-2">
                  審核勞基法、職災保護法及司法判決案例
                </p>
              </div>
            )}

            {/* Diagnostic Result State */}
            {!isLoading && renderedHtml && (
              <div className="flex flex-col h-full">
                <div
                  id="ai-result-header"
                  className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3"
                >
                  <div className="flex items-center space-x-2">
                    {reportType === "quota" ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                        <h3 className="text-amber-400 font-bold text-base">今日AI額度已使用完畢</h3>
                      </>
                    ) : reportType === "preset" ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                        <h3 className="text-white font-bold text-base">固定快選示範報告</h3>
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">固定快選</span>
                      </>
                    ) : reportType === "guidance" ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        <h3 className="text-amber-400 font-bold text-base">勞資戰略快篩提示</h3>
                      </>
                    ) : reportType === "strategic_engine" ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                        <h3 className="text-white font-bold text-base">企業勞資戰略診斷報告</h3>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                          策略人資總監模型
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                        <h3 className="text-white font-bold text-base">AI 即時診斷報告</h3>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">即時 AI 運算</span>
                      </>
                    )}

                    {(reportType === "real_ai" || reportType === "strategic_engine") && modelEngineInfo && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border flex items-center ${
                          modelEngineInfo.isDegraded
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}
                        title={
                          modelEngineInfo.isDegraded
                            ? "目前線上負載較高，系統已自動啟用階梯降級機制切換至節能 Lite 模型，保障服務不中斷"
                            : "使用 Google Gemini 深度推理引擎分析"
                        }
                      >
                        <Cpu className="w-3 h-3 mr-1" />
                        {modelEngineInfo.isDegraded ? (modelEngineInfo.model.includes("策略") ? "策略實戰決策模型" : "已自動降級為輕量模型") : "Gemini 深度引擎"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleCopyReport}
                      className="text-xs bg-slate-800 text-slate-200 hover:text-white px-3 py-1.5 rounded flex items-center border border-slate-700 hover:border-slate-500 transition"
                      title="複製報告文字"
                    >
                      {copiedSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-green-400" />
                          已複製
                        </>
                      ) : (
                        "複製全文"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={printReport}
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded flex items-center border border-slate-600 hover:border-amber-400 transition"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1 text-amber-400" />
                      列印報告
                    </button>
                  </div>
                </div>

                <div
                  id="ai-result"
                  className="ai-report-content flex-grow overflow-y-auto pr-2 custom-scrollbar max-h-[500px]"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />

                {/* UI 免責聲明：灰色斜體 */}
                <div
                  id="ui-disclaimer"
                  className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 italic flex justify-between items-center"
                >
                  <span>AI 勞資問題診斷，僅提供參考，不構成法律建議！</span>
                  <a
                    href="#contact"
                    className="not-italic text-amber-400 hover:underline font-normal text-xs"
                  >
                    預約團隊深度輔導 &rarr;
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
