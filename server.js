const express = require("express");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "KiranDidi@2026";

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

/* =========================================================
   QUESTIONS
   Q1-Q20 = SCORED
   Q21 = SECRET PERSONAL QUESTION / NOT SCORED
========================================================= */

const questions = [
  {
    id: 1,
    question: "चिकित्सा चतुष्पाद का सही क्रम क्या है?",
    options: [
      "रोगी, द्रव्य, उपस्थायक, भिषक्",
      "भिषक्, द्रव्य, उपस्थायक, रोगी",
      "द्रव्य, रोगी, भिषक्, उपस्थायक",
      "उपस्थायक, भिषक्, रोगी, द्रव्य"
    ],
    answer: 1,
    solution:
      "चिकित्सा के चार पाद हैं—भिषक्, द्रव्य, उपस्थाता/परिचारक और रोगी। प्रश्न में दिया गया क्रम B है।",
    trick:
      "Trick: भि → द्र → उ → रो"
  },

  {
    id: 2,
    question:
      "'अर्थज्ञ' गुण का वैद्य के संदर्भ में क्या अर्थ है?",
    options: [
      "फीस का हिसाब रखना",
      "शास्त्रों के व्यावहारिक अर्थ और प्रयोग को समझना",
      "जड़ी-बूटियाँ बेचना",
      "राजा का मंत्री होना"
    ],
    answer: 1,
    solution:
      "यहाँ 'अर्थ' का मतलब पैसा नहीं है। वैद्य को शास्त्रों के अर्थ को समझकर उनका उचित व्यावहारिक प्रयोग करना चाहिए।",
    trick:
      "Trick: अर्थ = meaning, money नहीं।"
  },

  {
    id: 3,
    question:
      "शास्त्रों को जानता है लेकिन कर्म में कुशल नहीं—किसके समान?",
    options: [
      "पंख विहीन पक्षी",
      "राजा",
      "अंधकार में दीपक",
      "सिंह"
    ],
    answer: 0,
    solution:
      "केवल शास्त्रज्ञान होने पर practical ability न हो तो वैद्य की उपयोगिता अधूरी है। शास्त्रज्ञान के साथ दृष्टकर्मता भी आवश्यक है।",
    trick:
      "Concept: शास्त्रज्ञान + दृष्टकर्मता = पूर्ण चिकित्सक।"
  },

  {
    id: 4,
    question:
      "'अनेकविधत्वम्' औषधि का क्या अर्थ है?",
    options: [
      "केवल एक रूप होना",
      "अनेक कल्पों में बनाया जा सकना",
      "अनेक देशों में मिलना",
      "अनेक मूल्य होना"
    ],
    answer: 1,
    solution:
      "अनेकविधत्वम् का अर्थ है औषधि का विभिन्न कल्पों में बनाया और उपयोग किया जा सकना।",
    trick:
      "Trick: अनेकविध = अनेक प्रकार।"
  },

  {
    id: 5,
    question:
      "औषधि का 'सम्पत्' गुण क्या है?",
    options: [
      "सुंदर पैकिंग",
      "अपने अपेक्षित गुणों से पूरी तरह संपन्न होना",
      "बहुत विषैला होना",
      "कृत्रिम होना"
    ],
    answer: 1,
    solution:
      "सम्पत् का अर्थ उचित और अपेक्षित गुणों से पूर्ण रूप से सम्पन्न होना है।",
    trick:
      "Trick: सम्पत् = proper quality / completeness."
  },

  {
    id: 6,
    question:
      "परिचारक का 'अनुरक्त' गुण क्या दर्शाता है?",
    options: [
      "रोगी से गुस्सा",
      "रोगी के प्रति स्नेह, दया और सेवा-भाव",
      "पैसों से लगाव",
      "काम से जी चुराना"
    ],
    answer: 1,
    solution:
      "अनुरक्त का अर्थ रोगी के प्रति प्रेम, स्नेह, दया और सेवा की भावना रखना है।",
    trick:
      "Trick: अनुरक्त = स्नेहयुक्त।"
  },

  {
    id: 7,
    question:
      "उपस्थायक किसके निर्देशों के अधीन काम करे?",
    options: [
      "रोगी",
      "रिश्तेदार",
      "भिषक् (वैद्य)",
      "स्वयं की इच्छा"
    ],
    answer: 2,
    solution:
      "रोगी की आवश्यकताओं का ध्यान रखते हुए परिचारक को चिकित्सकीय कार्य वैद्य के निर्देशानुसार करना चाहिए।",
    trick:
      "Trick: वैद्य निर्देश देता है → परिचारक पालन करता है।"
  },

  {
    id: 8,
    question:
      "'अध्याढ्य' गुण का मुख्य अर्थ क्या है?",
    options: [
      "बहुत बातें करना",
      "चिकित्सा के लिए आवश्यक साधन/धन रखने की क्षमता",
      "रोते रहना",
      "बिस्तर पर पड़े रहना"
    ],
    answer: 1,
    solution:
      "अध्याढ्य का अर्थ उपचार के लिए आवश्यक साधनों को वहन करने में सक्षम और साधन-संपन्न होना है।",
    trick:
      "Trick: अध्याढ्य = साधन-संपन्न।"
  },

  {
    id: 9,
    question:
      "'ज्ञापकत्व' का रोगी के संदर्भ में क्या अर्थ है?",
    options: [
      "दूसरों के रोग जानना",
      "अपने रोग के लक्षण और कष्ट चिकित्सक को सही बताना",
      "चुप रहना",
      "खुद डॉक्टर बनना"
    ],
    answer: 1,
    solution:
      "ज्ञापकत्व का अर्थ रोगी द्वारा अपने रोग के लक्षण और कष्ट चिकित्सक को सही एवं उचित रूप से बताना है।",
    trick:
      "Trick: ज्ञापक = जानकारी देने वाला।"
  },

  {
    id: 10,
    question:
      "रोगी के चार गुणों का सही समूह कौन-सा है?",
    options: [
      "स्मृति, निर्देशकारित्व, भीरुत्व, धनहीनता",
      "ज्ञापकत्व, निर्देशकारित्व, सत्त्ववान्, अध्याढ्य",
      "बहुत्व, योग्यता, अनुराग, शौच",
      "दक्ष, शास्त्रज्ञ, शौच, निर्भय"
    ],
    answer: 1,
    solution:
      "रोगी के चार प्रमुख गुण हैं—ज्ञापकत्व, निर्देशकारित्व, सत्त्ववान् और अध्याढ्य।",
    trick:
      "Trick: Patient = बताए + माने + सहे + साधन रखे।"
  },

  {
    id: 11,
    question:
      "आत्रेय और मैत्रेय के बीच मुख्य संशय किस विषय को लेकर था?",
    options: [
      "पुनर्जन्म",
      "चिकित्सा प्रभावी है या निष्फल",
      "आत्मा विभु है या अणु",
      "रस 6 हैं या 8"
    ],
    answer: 1,
    solution:
      "मैत्रेय की शंका चिकित्सा की प्रभावशीलता पर थी—चिकित्सा सफल होती है या निष्फल।",
    trick:
      "Trick: मुख्य विवाद = चिकित्सा की सिद्धि।"
  },

  {
    id: 12,
    question:
      "रोगों का कुल मुख्य वर्गीकरण कितने प्रकार का है?",
    options: [
      "2",
      "4",
      "6",
      "8"
    ],
    answer: 1,
    solution:
      "रोगों का मुख्य वर्गीकरण चार प्रकार का है—सुखसाध्य, कृच्छ्रसाध्य, याप्य और प्रत्याख्येय।",
    trick:
      "Trick: 2 साध्य + 2 असाध्य = 4।"
  },

  {
    id: 13,
    question:
      "साध्य रोगों के दो भेद कौन-से हैं?",
    options: [
      "सुखसाध्य और कृच्छ्रसाध्य",
      "याप्य और प्रत्याख्येय",
      "मृदु और दारुण",
      "निज और आगंतुक"
    ],
    answer: 0,
    solution:
      "साध्य रोगों के दो भेद सुखसाध्य और कृच्छ्रसाध्य हैं।",
    trick:
      "Trick: साध्य = सुख + कृच्छ्र।"
  },

  {
    id: 14,
    question:
      "असाध्य रोगों के दो भेद कौन-से हैं?",
    options: [
      "सुखसाध्य और कृच्छ्रसाध्य",
      "याप्य और प्रत्याख्येय",
      "शारीरिक और मानसिक",
      "वातज और पित्तज"
    ],
    answer: 1,
    solution:
      "असाध्य रोगों के दो भेद याप्य और प्रत्याख्येय हैं।",
    trick:
      "Trick: असाध्य = याप्य + प्रत्याख्येय।"
  },

  {
    id: 15,
    question:
      "याप्य रोग की किस उपमा से तुलना की गई है?",
    options: [
      "टूटे घड़े की",
      "जर्जर मकान को खंभे के सहारे टिकाए रखने की",
      "सूखे पेड़ की",
      "बहती नदी की"
    ],
    answer: 1,
    solution:
      "याप्य रोग चिकित्सा और पथ्य के सहारे नियंत्रित रहता है। इसकी तुलना जर्जर मकान को खंभे के सहारे टिकाए रखने से की गई है।",
    trick:
      "Trick: याप्य = सहारे से टिकता है।"
  },

  {
    id: 16,
    question:
      "यदि दूष्य, प्रकृति और ऋतु समान न हों, तो रोग कैसा होगा?",
    options: [
      "कृच्छ्रसाध्य",
      "सुखसाध्य",
      "याप्य",
      "प्रत्याख्येय"
    ],
    answer: 1,
    solution:
      "रोग को बढ़ाने वाली अनुकूल परिस्थितियों के अभाव में रोग की साध्यता बढ़ती है, इसलिए रोग सुखसाध्य माना जाता है।",
    trick:
      "Trick: अनुकूल रोग-वर्धक परिस्थितियों का अभाव → साध्यता बढ़ती है।"
  },

  {
    id: 17,
    question:
      "सुखसाध्य रोग में दोषों के मार्ग की संख्या कितनी होनी चाहिए?",
    options: [
      "एक मार्ग",
      "दो मार्ग",
      "तीन मार्ग",
      "सभी मार्ग"
    ],
    answer: 0,
    solution:
      "एक मार्ग होने से रोग comparatively localized और सरल रहता है, इसलिए सुखसाध्य माना जाता है।",
    trick:
      "Trick: 1 = सुखसाध्य।"
  },

  {
    id: 18,
    question:
      "द्विदोषज रोग और दो मार्ग होने पर सामान्यतः क्या होता है?",
    options: [
      "सुखसाध्य",
      "याप्य",
      "प्रत्याख्येय",
      "कृच्छ्रसाध्य"
    ],
    answer: 1,
    solution:
      "द्विदोषज रोग और दो मार्ग होने की स्थिति याप्य रोग से संबंधित है।",
    trick:
      "Trick: 2 दोष + 2 मार्ग → याप्य।"
  },

  {
    id: 19,
    question:
      "प्रत्याख्येय रोग में कितने दोष दूषित होते हैं?",
    options: [
      "एक",
      "दो",
      "तीनों दोष",
      "कोई नहीं"
    ],
    answer: 2,
    solution:
      "प्रत्याख्येय गंभीर अवस्था है जिसमें त्रिदोष की संलिप्तता मानी जाती है।",
    trick:
      "Trick: 3 दोष → गंभीर → प्रत्याख्येय।"
  },

  {
    id: 20,
    question:
      "यदि रोग सभी तीन मार्गों में फैल चुका हो, तो वह क्या होगा?",
    options: [
      "सुखसाध्य",
      "कृच्छ्रसाध्य",
      "याप्य",
      "प्रत्याख्येय (असाध्य)"
    ],
    answer: 3,
    solution:
      "तीनों मार्गों में रोग का प्रसार अत्यंत गंभीर स्थिति को दर्शाता है और इसे प्रत्याख्येय/असाध्य माना जाता है।",
    trick:
      "Trick: तीनों मार्ग → अत्यंत गंभीर → प्रत्याख्येय।"
  },

  /* SECRET QUESTION */

  {
    id: 21,
    question:
      "Kiran Didi kya hain? 🤭",
    options: [
      "Moti 🐼",
      "Bandariya 🐒",
      "Bhains 🐃",
      "Upar ke teeno 🤣"
    ],
    answer: 3,
    solution:
      "Secret fun question! 😂",
    trick:
      ""
  }
];


/* =========================================================
   TEMPORARY RESULTS
========================================================= */

let results = [];


/* =========================================================
   QUESTIONS API
========================================================= */

app.get("/api/questions", (req, res) => {

  const safeQuestions =
    questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options
    }));

  res.json(safeQuestions);

});


/* =========================================================
   SUBMIT
   ONLY Q1-Q20 COUNT
========================================================= */

app.post("/api/submit", (req, res) => {

  try {

    const {
      name,
      answers,
      timeTaken
    } = req.body;

    if (
      !name ||
      !Array.isArray(answers)
    ) {

      return res.status(400).json({
        error: "Invalid submission."
      });

    }

    let score = 0;

    const review =
      questions.map(q => {

        const submitted =
          answers.find(
            a =>
              Number(a.questionId) ===
              q.id
          );

        let selectedAnswer = null;

        if (
          submitted &&
          Number.isInteger(
            submitted.answer
          )
        ) {

          if (
            submitted.answer >= 0 &&
            submitted.answer <
              q.options.length
          ) {

            selectedAnswer =
              submitted.answer;

          }

        }

        const isCorrect =
          selectedAnswer ===
          q.answer;

        /*
          Q21 IS NOT SCORED
        */

        if (
          q.id <= 20 &&
          isCorrect
        ) {

          score++;

        }

        return {

          questionId:
            q.id,

          question:
            q.question,

          options:
            q.options,

          selectedAnswer,

          selectedText:
            selectedAnswer === null
              ? null
              : q.options[
                  selectedAnswer
                ],

          correctAnswer:
            q.answer,

          correctText:
            q.options[
              q.answer
            ],

          isCorrect,

          counted:
            q.id <= 20,

          solution:
            q.solution,

          trick:
            q.trick

        };

      });


    const result = {

      id:
        Date.now().toString(),

      name:
        String(name)
          .substring(0, 60),

      score,

      total: 20,

      percentage:
        Math.round(
          (score / 20) * 100
        ),

      timeTaken:
        Number(timeTaken) || 0,

      submittedAt:
        new Date().toISOString(),

      review

    };


    results.push(result);


    res.json({
      success: true,
      result
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Server error."
    });

  }

});


/* =========================================================
   ADMIN RESULTS
========================================================= */

app.post(
  "/api/admin/results",
  (req, res) => {

    const {
      password
    } = req.body;

    if (
      password !==
      ADMIN_PASSWORD
    ) {

      return res
        .status(401)
        .json({
          error:
            "Unauthorized"
        });

    }

    const sorted =
      [...results].sort(
        (a, b) => {

          if (
            b.score !==
            a.score
          ) {

            return (
              b.score -
              a.score
            );

          }

          return (
            a.timeTaken -
            b.timeTaken
          );

        }
      );

    res.json(sorted);

  }
);


/* =========================================================
   FONT SYSTEM
   Noto Sans Devanagari
========================================================= */

const FONT_DIR =
  path.join(
    __dirname,
    ".fonts"
  );

const REGULAR_FONT =
  path.join(
    FONT_DIR,
    "NotoSansDevanagari-Regular.ttf"
  );

const BOLD_FONT =
  path.join(
    FONT_DIR,
    "NotoSansDevanagari-Bold.ttf"
  );


const REGULAR_FONT_URL =
  "https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Regular.ttf";

const BOLD_FONT_URL =
  "https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Bold.ttf";


async function downloadFont(
  url,
  destination
) {

  if (
    fs.existsSync(destination)
  ) {

    return;

  }

  fs.mkdirSync(
    FONT_DIR,
    {
      recursive: true
    }
  );

  console.log(
    "Downloading PDF font..."
  );

  const response =
    await fetch(url);

  if (!response.ok) {

    throw new Error(
      `Font download failed: ${response.status}`
    );

  }

  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    );

  fs.writeFileSync(
    destination,
    buffer
  );

  console.log(
    "PDF font downloaded."
  );

}


async function ensureFonts() {

  try {

    await downloadFont(
      REGULAR_FONT_URL,
      REGULAR_FONT
    );

    await downloadFont(
      BOLD_FONT_URL,
      BOLD_FONT
    );

    return true;

  } catch (error) {

    console.error(
      "Could not download Devanagari fonts:",
      error.message
    );

    return false;

  }

}


/* =========================================================
   PDF HELPERS
========================================================= */

function formatTime(seconds) {

  seconds =
    Number(seconds) || 0;

  const minutes =
    Math.floor(
      seconds / 60
    );

  const remaining =
    seconds % 60;

  return (
    `${minutes}m ${String(
      remaining
    ).padStart(2, "0")}s`
  );

}


function drawRoundedBox(
  doc,
  x,
  y,
  width,
  height,
  radius,
  fill,
  stroke
) {

  doc
    .roundedRect(
      x,
      y,
      width,
      height,
      radius
    );

  if (fill) {

    doc
      .fillColor(fill)
      .fill();

  }

  if (stroke) {

    doc
      .lineWidth(1)
      .strokeColor(stroke)
      .stroke();

  }

}


function ensureSpace(
  doc,
  needed
) {

  const bottom =
    doc.page.height -
    55;

  if (
    doc.y + needed >
    bottom
  ) {

    doc.addPage();

    return true;

  }

  return false;

}


function writeLabelValue(
  doc,
  label,
  value,
  x,
  y,
  width
) {

  doc
    .font("PDFRegular")
    .fontSize(9)
    .fillColor("#777777")
    .text(
      label,
      x,
      y,
      {
        width
      }
    );

  doc
    .font("PDFBold")
    .fontSize(13)
    .fillColor("#111111")
    .text(
      value,
      x,
      y + 13,
      {
        width
      }
    );

}


/* =========================================================
   GENERATE PREMIUM PDF
========================================================= */

function generatePDF(
  result,
  res
) {

  const doc =
    new PDFDocument({
      size: "A4",
      margin: 45,
      bufferPages: true
    });


  res.setHeader(
    "Content-Type",
    "application/pdf"
  );


  const safeName =
    result.name.replace(
      /[^a-z0-9]/gi,
      "-"
    );


  res.setHeader(
    "Content-Disposition",
    `attachment; filename="Kiran-Didi-Quiz-${safeName}.pdf"`
  );


  doc.pipe(res);


  /* REGISTER FONTS */

  doc.registerFont(
    "PDFRegular",
    REGULAR_FONT
  );

  doc.registerFont(
    "PDFBold",
    BOLD_FONT
  );


  /* PAGE BACKGROUND */

  function pageHeader() {

    doc
      .save()
      .rect(
        0,
        0,
        doc.page.width,
        18
      )
      .fill("#111111")
      .restore();

  }


  /* =====================================================
     COVER / SUMMARY
  ===================================================== */

  pageHeader();


  doc
    .font("PDFBold")
    .fontSize(30)
    .fillColor("#111111")
    .text(
      "KIRAN DIDI QUIZ",
      45,
      65,
      {
        align: "center",
        width:
          doc.page.width - 90
      }
    );


  doc
    .font("PDFRegular")
    .fontSize(12)
    .fillColor("#777777")
    .text(
      "OFFICIAL TEST REPORT",
      45,
      105,
      {
        align: "center",
        width:
          doc.page.width - 90
      }
    );


  doc.moveDown(2);


  drawRoundedBox(
    doc,
    45,
    150,
    doc.page.width - 90,
    125,
    16,
    "#f7f7f7",
    "#e2e2e2"
  );


  doc
    .font("PDFBold")
    .fontSize(21)
    .fillColor("#111111")
    .text(
      `Rank #1`,
      65,
      175,
      {
        width:
          doc.page.width - 130,
        align: "center"
      }
    );


  doc
    .font("PDFRegular")
    .fontSize(15)
    .fillColor("#555555")
    .text(
      result.name,
      65,
      210,
      {
        width:
          doc.page.width - 130,
        align: "center"
      }
    );


  /* STATS */

  const statY = 305;

  const statWidth =
    (doc.page.width - 110) /
    3;


  drawRoundedBox(
    doc,
    45,
    statY,
    statWidth,
    82,
    12,
    "#111111",
    "#111111"
  );


  drawRoundedBox(
    doc,
    55 + statWidth,
    statY,
    statWidth,
    82,
    12,
    "#f2f2f2",
    "#dddddd"
  );


  drawRoundedBox(
    doc,
    65 + statWidth * 2,
    statY,
    statWidth,
    82,
    12,
    "#f2f2f2",
    "#dddddd"
  );


  doc
    .font("PDFRegular")
    .fontSize(9)
    .fillColor("#aaaaaa")
    .text(
      "SCORE",
      55,
      statY + 16,
      {
        width:
          statWidth - 20,
        align: "center"
      }
    );


  doc
    .font("PDFBold")
    .fontSize(19)
    .fillColor("#ffffff")
    .text(
      `${result.score}/20`,
      55,
      statY + 34,
      {
        width:
          statWidth - 20,
        align: "center"
      }
    );


  doc
    .font("PDFRegular")
    .fontSize(9)
    .fillColor("#777777")
    .text(
      "PERCENTAGE",
      65 + statWidth,
      statY + 16,
      {
        width:
          statWidth - 20,
        align: "center"
      }
    );


  doc
    .font("PDFBold")
    .fontSize(19)
    .fillColor("#111111")
    .text(
      `${result.percentage}%`,
      65 + statWidth,
      statY + 34,
      {
        width:
          statWidth - 20,
        align: "center"
      }
    );


  doc
    .font("PDFRegular")
    .fontSize(9)
    .fillColor("#777777")
    .text(
      "TIME",
      75 + statWidth * 2,
      statY + 16,
      {
        width:
          statWidth - 20,
        align: "center"
      }
    );


  doc
    .font("PDFBold")
    .fontSize(15)
    .fillColor("#111111")
    .text(
      formatTime(
        result.timeTaken
      ),
      75 + statWidth * 2,
      statY + 35,
      {
        width:
          statWidth - 20,
        align: "center"
      }
    );


  doc
    .font("PDFRegular")
    .fontSize(9)
    .fillColor("#888888")
    .text(
      `Submitted: ${new Date(
        result.submittedAt
      ).toLocaleString()}`,
      45,
      415,
      {
        align: "center",
        width:
          doc.page.width - 90
      }
    );


  doc.moveDown(4);


  drawRoundedBox(
    doc,
    75,
    475,
    doc.page.width - 150,
    105,
    14,
    "#fafafa",
    "#dddddd"
  );


  doc
    .font("PDFBold")
    .fontSize(18)
    .fillColor("#111111")
    .text(
      "Congratulations!",
      95,
      500,
      {
        width:
          doc.page.width - 190,
        align: "center"
      }
    );


  doc
    .font("PDFRegular")
    .fontSize(12)
    .fillColor("#555555")
    .text(
      "Kiran Didi officially secured Rank #1.",
      95,
      530,
      {
        width:
          doc.page.width - 190,
        align: "center"
      }
    );


  doc
    .font("PDFBold")
    .fontSize(13)
    .fillColor("#111111")
    .text(
      "Didi Queen Award",
      95,
      555,
      {
        width:
          doc.page.width - 190,
        align: "center"
      }
    );


  /* =====================================================
     ANSWER REVIEW PAGE
  ===================================================== */

  doc.addPage();


  function reviewTitle() {

    doc
      .font("PDFBold")
      .fontSize(20)
      .fillColor("#111111")
      .text(
        "ANSWER REVIEW"
      );

    doc.moveDown(0.3);

    doc
      .font("PDFRegular")
      .fontSize(9)
      .fillColor("#777777")
      .text(
        "Question-wise response and explanation"
      );

    doc.moveDown(1);

  }


  reviewTitle();


  result.review.forEach(
    (item, index) => {

      const questionText =
        `Q${index + 1}. ${item.question}`;


      /* Estimate enough space */

      ensureSpace(
        doc,
        180
      );


      const boxX = 45;

      const boxWidth =
        doc.page.width - 90;

      const startY =
        doc.y;


      /* QUESTION */

      doc
        .font("PDFBold")
        .fontSize(12)
        .fillColor("#111111")
        .text(
          questionText,
          boxX + 14,
          startY + 13,
          {
            width:
              boxWidth - 28,
            lineGap: 3
          }
        );


      doc.moveDown(0.5);


      /*
        Options
      */

      item.options.forEach(
        (
          option,
          optionIndex
        ) => {

          const letter =
            String.fromCharCode(
              65 +
              optionIndex
            );

          const isCorrect =
            optionIndex ===
            item.correctAnswer;

          const isSelected =
            optionIndex ===
            item.selectedAnswer;


          let prefix =
            `${letter}. `;

          let suffix = "";


          if (
            isCorrect &&
            isSelected
          ) {

            suffix =
              "  [CORRECT + SELECTED]";

          } else if (
            isCorrect
          ) {

            suffix =
              "  [CORRECT ANSWER]";

          } else if (
            isSelected
          ) {

            suffix =
              "  [YOUR ANSWER]";

          }


          const text =
            prefix +
            option +
            suffix;


          const optionColor =
            isCorrect
              ? "#15803d"
              : isSelected
                ? "#b45309"
                : "#333333";


          doc
            .font(
              isCorrect ||
              isSelected
                ? "PDFBold"
                : "PDFRegular"
            )
            .fontSize(9.5)
            .fillColor(
              optionColor
            )
            .text(
              text,
              boxX + 20,
              doc.y,
              {
                width:
                  boxWidth - 40,
                lineGap: 2
              }
            );

          doc.moveDown(0.15);

        }
      );


      /* ANSWER SUMMARY */

      doc.moveDown(0.3);


      const answerY =
        doc.y;


      drawRoundedBox(
        doc,
        boxX + 12,
        answerY,
        boxWidth - 24,
        55,
        8,
        "#f7f7f7",
        "#e2e2e2"
      );


      doc
        .font("PDFBold")
        .fontSize(9)
        .fillColor("#555555")
        .text(
          "YOUR ANSWER",
          boxX + 23,
          answerY + 9,
          {
            width: 150
          }
        );


      doc
        .font("PDFRegular")
        .fontSize(9.5)
        .fillColor("#111111")
        .text(
          item.selectedText ===
          null
            ? "Not Attempted"
            : item.selectedText,
          boxX + 23,
          answerY + 25,
          {
            width:
              boxWidth / 2 - 30
          }
        );


      doc
        .font("PDFBold")
        .fontSize(9)
        .fillColor("#555555")
        .text(
          "CORRECT ANSWER",
          boxX +
            boxWidth / 2,
          answerY + 9,
          {
            width: 150
          }
        );


      doc
        .font("PDFRegular")
        .fontSize(9.5)
        .fillColor("#15803d")
        .text(
          item.correctText,
          boxX +
            boxWidth / 2,
          answerY + 25,
          {
            width:
              boxWidth / 2 - 30
          }
        );


      doc.y =
        answerY + 67;


      /* SOLUTION */

      const solutionStart =
        doc.y;


      doc
        .font("PDFBold")
        .fontSize(10)
        .fillColor("#111111")
        .text(
          "SOLUTION / EXPLANATION",
          boxX + 12,
          solutionStart,
          {
            width:
              boxWidth - 24
          }
        );


      doc.moveDown(0.25);


      doc
        .font("PDFRegular")
        .fontSize(9.5)
        .fillColor("#444444")
        .text(
          item.solution,
          boxX + 12,
          doc.y,
          {
            width:
              boxWidth - 24,
            lineGap: 3
          }
        );


      if (
        item.trick
      ) {

        doc.moveDown(0.35);

        doc
          .font("PDFBold")
          .fontSize(9)
          .fillColor("#555555")
          .text(
            item.trick,
            boxX + 12,
            doc.y,
            {
              width:
                boxWidth - 24
            }
          );

      }


      doc.moveDown(0.9);


      /* Separator */

      doc
        .moveTo(
          boxX,
          doc.y
        )
        .lineTo(
          boxX +
            boxWidth,
          doc.y
        )
        .lineWidth(0.6)
        .strokeColor(
          "#dddddd"
        )
        .stroke();


      doc.moveDown(0.9);


      /*
        Q21 is intentionally displayed
        without revealing that it is
        excluded from the score.
      */

    }
  );


  /* =====================================================
     FINAL PAGE
  ===================================================== */

  ensureSpace(
    doc,
    250
  );


  doc.moveDown(1);


  drawRoundedBox(
    doc,
    60,
    doc.y,
    doc.page.width - 120,
    220,
    18,
    "#111111",
    "#111111"
  );


  const finalY =
    doc.y;


  doc
    .font("PDFBold")
    .fontSize(25)
    .fillColor("#ffffff")
    .text(
      "CONGRATULATIONS",
      80,
      finalY + 35,
      {
        width:
          doc.page.width - 160,
        align: "center"
      }
    );


  doc
    .font("PDFRegular")
    .fontSize(13)
    .fillColor("#dddddd")
    .text(
      "Kiran Didi officially secured Rank #1.",
      80,
      finalY + 80,
      {
        width:
          doc.page.width - 160,
        align: "center"
      }
    );


  doc
    .font("PDFBold")
    .fontSize(18)
    .fillColor("#ffffff")
    .text(
      "Didi Queen Award",
      80,
      finalY + 120,
      {
        width:
          doc.page.width - 160,
        align: "center"
      }
    );


  doc
    .font("PDFRegular")
    .fontSize(11)
    .fillColor("#cccccc")
    .text(
      "Special Treat + Unlimited Appreciation",
      80,
      finalY + 153,
      {
        width:
          doc.page.width - 160,
        align: "center"
      }
    );


  doc
    .font("PDFRegular")
    .fontSize(9)
    .fillColor("#aaaaaa")
    .text(
      "Thank you for completing the Kiran Didi Quiz.",
      80,
      finalY + 190,
      {
        width:
          doc.page.width - 160,
        align: "center"
      }
    );


  /* =====================================================
     PAGE NUMBERS
  ===================================================== */

  const range =
    doc.bufferedPageRange();


  for (
    let i = range.start;
    i < range.start + range.count;
    i++
  ) {

    doc.switchToPage(i);


    doc
      .font("PDFRegular")
      .fontSize(8)
      .fillColor("#999999")
      .text(
        `Kiran Didi Quiz  •  Page ${i + 1} of ${range.count}`,
        45,
        doc.page.height - 28,
        {
          width:
            doc.page.width - 90,
          align: "center"
        }
      );

  }


  doc.end();

}


/* =========================================================
   PDF ROUTE
========================================================= */

app.get(
  "/api/result/:id/pdf",
  (req, res) => {

    const result =
      results.find(
        r =>
          r.id ===
          req.params.id
      );

    if (!result) {

      return res
        .status(404)
        .send(
          "Result not found."
        );

    }

    /*
      Fonts should already be
      downloaded when server starts.
    */

    generatePDF(
      result,
      res
    );

  }
);


/* =========================================================
   ADMIN PANEL
========================================================= */

app.get(
  "/admin",
  (req, res) => {

    res.send(`

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
>

<title>Kiran Didi Quiz — Admin</title>

<style>

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #f7f7f7;
  color: #111;
  font-family: Arial, sans-serif;
}

.container {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}

.card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 16px;
  padding: 22px;
  margin-bottom: 20px;
}

h1 {
  margin-top: 0;
}

input {
  width: 100%;
  padding: 14px;
  border: 1px solid #ccc;
  border-radius: 9px;
  font-size: 16px;
  margin-bottom: 12px;
}

button {
  border: 0;
  background: #111;
  color: white;
  padding: 13px 20px;
  border-radius: 9px;
  font-size: 16px;
}

.stats {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 15px 0;
}

.stat {
  background: #f3f3f3;
  padding: 12px;
  border-radius: 10px;
}

.question {
  border-top: 1px solid #eee;
  padding: 15px 0;
}

.secret {
  background: #fff7ed;
  border: 1px dashed #f97316;
  padding: 15px;
  border-radius: 10px;
  margin-top: 10px;
}

.correct {
  color: #15803d;
  font-weight: bold;
}

.wrong {
  color: #c62828;
  font-weight: bold;
}

.pdf {
  display: inline-block;
  background: #111;
  color: white;
  text-decoration: none;
  padding: 11px 15px;
  border-radius: 8px;
  margin: 10px 0;
}

</style>

</head>

<body>

<div class="container">

<div class="card">

<h1>
🔐 Quiz Admin
</h1>

<p>
Kiran Didi Quiz Results
</p>

<input
  type="password"
  id="password"
  placeholder="Admin password"
>

<button
  onclick="loadResults()"
>
View Results
</button>

</div>

<div id="results"></div>

</div>


<script>

async function loadResults() {

  const password =
    document
      .getElementById(
        "password"
      )
      .value;


  const response =
    await fetch(
      "/api/admin/results",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            password
          })
      }
    );


  if (!response.ok) {

    alert(
      "Wrong password!"
    );

    return;

  }


  const results =
    await response.json();


  const container =
    document.getElementById(
      "results"
    );


  container.innerHTML =
    "";


  if (!results.length) {

    container.innerHTML = \`

      <div class="card">

        <h2>
          No submissions yet.
        </h2>

        <p>
          Quiz submit hone ke baad
          result yahan dikhega.
        </p>

      </div>

    \`;

    return;

  }


  results.forEach(
    (result, index) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "card";


      let html = \`

        <h2>
          🏆 Rank #\${index + 1}
        </h2>

        <h3>
          \${escapeHtml(
            result.name
          )}
        </h3>

        <div class="stats">

          <div class="stat">
            <b>Score</b><br>
            \${result.score}/20
          </div>

          <div class="stat">
            <b>Percentage</b><br>
            \${result.percentage}%
          </div>

          <div class="stat">
            <b>Time</b><br>
            \${formatTime(
              result.timeTaken
            )}
          </div>

        </div>

        <a
          class="pdf"
          href="/api/result/\${result.id}/pdf"
          target="_blank"
        >
          📄 Download Premium PDF
        </a>

        <h3>
          Answer Review
        </h3>

      \`;


      result.review.forEach(
        item => {

          const boxClass =
            item.questionId === 21
              ? "secret"
              : "question";


          html += \`

            <div class="\${boxClass}">

              <b>
                Q\${item.questionId}.
                \${escapeHtml(
                  item.question
                )}
              </b>

              <p>
                <b>
                  Your Answer:
                </b>

                \${
                  item.selectedText === null
                    ? "Not Attempted"
                    : escapeHtml(
                        item.selectedText
                      )
                }

              </p>

              <p>
                <b>
                  Correct Answer:
                </b>

                \${escapeHtml(
                  item.correctText
                )}

              </p>

              <p class="\${
                item.isCorrect
                  ? "correct"
                  : "wrong"
              }">

                \${
                  item.isCorrect
                    ? "✓ Correct"
                    : "✗ Wrong"
                }

                \${
                  item.questionId === 21
                    ? " — Secret Question"
                    : ""
                }

              </p>

            </div>

          \`;

        }
      );


      card.innerHTML =
        html;


      container.appendChild(
        card
      );

    }
  );

}


function formatTime(
  seconds
) {

  seconds =
    Number(seconds) || 0;

  const minutes =
    Math.floor(
      seconds / 60
    );

  const remaining =
    seconds % 60;

  return (
    minutes +
    "m " +
    remaining +
    "s"
  );

}


function escapeHtml(
  text
) {

  return String(text)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}

</script>

</body>

</html>

    `);

  }
);


/* =========================================================
   START SERVER
========================================================= */

async function startServer() {

  await ensureFonts();

  app.listen(
    PORT,
    "0.0.0.0",
    () => {

      console.log(
        `Kiran Didi Quiz running on port ${PORT}`
      );

      console.log(
        "PDF font system ready."
      );

    }
  );

}

startServer();
