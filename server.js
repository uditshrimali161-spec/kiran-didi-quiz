const express = require("express");
const PDFDocument = require("pdfkit");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "KiranDidi@2026";

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));


/* =========================================
   QUESTIONS
   Q1-Q20 = SCORED
   Q21 = SECRET / NOT SCORED
========================================= */

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
      "चिकित्सा के चार पाद हैं—भिषक्, द्रव्य, उपस्थाता/परिचारक और रोगी। दिए गए विकल्पों में B सही क्रम है।"
  },

  {
    id: 2,
    question: "'अर्थज्ञ' गुण का वैद्य के संदर्भ में क्या अर्थ है?",
    options: [
      "फीस का हिसाब रखना",
      "शास्त्रों के व्यावहारिक अर्थ और प्रयोग को समझना",
      "जड़ी-बूटियाँ बेचना",
      "राजा का मंत्री होना"
    ],
    answer: 1,
    solution:
      "यहाँ 'अर्थ' का अर्थ धन नहीं बल्कि शास्त्र के अर्थ को समझकर उसका उचित प्रयोग करना है।"
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
      "केवल शास्त्रज्ञान पर्याप्त नहीं है। व्यावहारिक कर्म-कौशल भी आवश्यक है।"
  },

  {
    id: 4,
    question: "'अनेकविधत्वम्' औषधि का क्या अर्थ है?",
    options: [
      "केवल एक रूप होना",
      "अनेक कल्पों में बनाया जा सकना",
      "अनेक देशों में मिलना",
      "अनेक मूल्य होना"
    ],
    answer: 1,
    solution:
      "अनेकविधत्वम् का अर्थ है औषधि का विभिन्न कल्पों में बनाया और उपयोग किया जा सकना।"
  },

  {
    id: 5,
    question: "औषधि का 'सम्पत्' गुण क्या है?",
    options: [
      "सुंदर पैकिंग",
      "अपने अपेक्षित गुणों से पूरी तरह संपन्न होना",
      "बहुत विषैला होना",
      "कृत्रिम होना"
    ],
    answer: 1,
    solution:
      "सम्पत् का अर्थ है उचित एवं अपेक्षित गुणों से सम्पन्न होना।"
  },

  {
    id: 6,
    question: "परिचारक का 'अनुरक्त' गुण क्या दर्शाता है?",
    options: [
      "रोगी से गुस्सा",
      "रोगी के प्रति स्नेह, दया और सेवा-भाव",
      "पैसों से लगाव",
      "काम से जी चुराना"
    ],
    answer: 1,
    solution:
      "अनुरक्त का अर्थ रोगी के प्रति स्नेह, प्रेम और सेवा-भाव रखना है।"
  },

  {
    id: 7,
    question: "उपस्थायक किसके निर्देशों के अधीन काम करे?",
    options: [
      "रोगी",
      "रिश्तेदार",
      "भिषक् (वैद्य)",
      "स्वयं की इच्छा"
    ],
    answer: 2,
    solution:
      "उपस्थायक को चिकित्सकीय कार्यों में भिषक् अर्थात् वैद्य के निर्देशों के अनुसार कार्य करना चाहिए।"
  },

  {
    id: 8,
    question: "'अध्याढ्य' गुण का मुख्य अर्थ क्या है?",
    options: [
      "बहुत बातें करना",
      "चिकित्सा के लिए आवश्यक साधन/धन रखने की क्षमता",
      "रोते रहना",
      "बिस्तर पर पड़े रहना"
    ],
    answer: 1,
    solution:
      "अध्याढ्य का अर्थ उपचार के लिए आवश्यक साधनों को वहन करने में सक्षम और साधन-संपन्न होना है।"
  },

  {
    id: 9,
    question: "'ज्ञापकत्व' का रोगी के संदर्भ में क्या अर्थ है?",
    options: [
      "दूसरों के रोग जानना",
      "अपने रोग के लक्षण और कष्ट चिकित्सक को सही बताना",
      "चुप रहना",
      "खुद डॉक्टर बनना"
    ],
    answer: 1,
    solution:
      "ज्ञापकत्व का अर्थ रोगी द्वारा अपने रोग के लक्षणों और कष्टों की उचित जानकारी चिकित्सक को देना है।"
  },

  {
    id: 10,
    question: "रोगी के चार गुणों का सही समूह कौन-सा है?",
    options: [
      "स्मृति, निर्देशकारित्व, भीरुत्व, धनहीनता",
      "ज्ञापकत्व, निर्देशकारित्व, सत्त्ववान्, अध्याढ्य",
      "बहुत्व, योग्यता, अनुराग, शौच",
      "दक्ष, शास्त्रज्ञ, शौच, निर्भय"
    ],
    answer: 1,
    solution:
      "रोगी के चार प्रमुख गुण हैं—ज्ञापकत्व, निर्देशकारित्व, सत्त्ववान् और अध्याढ्य।"
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
      "मैत्रेय की शंका चिकित्सा की प्रभावशीलता अर्थात् चिकित्सा सफल होती है या निष्फल, इस विषय को लेकर थी।"
  },

  {
    id: 12,
    question: "रोगों का कुल मुख्य वर्गीकरण कितने प्रकार का है?",
    options: [
      "2",
      "4",
      "6",
      "8"
    ],
    answer: 1,
    solution:
      "रोग चार प्रकार के बताए गए हैं—सुखसाध्य, कृच्छ्रसाध्य, याप्य और प्रत्याख्येय।"
  },

  {
    id: 13,
    question: "साध्य रोगों के दो भेद कौन-से हैं?",
    options: [
      "सुखसाध्य और कृच्छ्रसाध्य",
      "याप्य और प्रत्याख्येय",
      "मृदु और दारुण",
      "निज और आगंतुक"
    ],
    answer: 0,
    solution:
      "साध्य रोग दो प्रकार के हैं—सुखसाध्य और कृच्छ्रसाध्य।"
  },

  {
    id: 14,
    question: "असाध्य रोगों के दो भेद कौन-से हैं?",
    options: [
      "सुखसाध्य और कृच्छ्रसाध्य",
      "याप्य और प्रत्याख्येय",
      "शारीरिक और मानसिक",
      "वातज और पित्तज"
    ],
    answer: 1,
    solution:
      "असाध्य रोगों के दो भेद याप्य और प्रत्याख्येय हैं।"
  },

  {
    id: 15,
    question: "याप्य रोग की किस उपमा से तुलना की गई है?",
    options: [
      "टूटे घड़े की",
      "जर्जर मकान को खंभे के सहारे टिकाए रखने की",
      "सूखे पेड़ की",
      "बहती नदी की"
    ],
    answer: 1,
    solution:
      "याप्य रोग उचित चिकित्सा और पथ्य के सहारे नियंत्रित रहता है।"
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
      "रोग को बढ़ाने वाली अनुकूल परिस्थितियों के अभाव में रोग की साध्यता बढ़ती है।"
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
      "एक मार्ग में स्थित रोग comparatively सरल होता है और सुखसाध्य माना जाता है।"
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
      "द्विदोषज रोग और दो मार्गों से संबंधित स्थिति याप्य रोग से संबंधित मानी जाती है।"
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
      "प्रत्याख्येय गंभीर अवस्था है जिसमें त्रिदोष की संलिप्तता मानी जाती है।"
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
      "तीनों मार्गों में रोग का प्रसार अत्यंत गंभीर अवस्था को दर्शाता है और इसे प्रत्याख्येय माना जाता है।"
  },

  {
    id: 21,
    question: "Kiran Didi kya hain? 🤭",
    options: [
      "Moti 🐼",
      "Bandariya 🐒",
      "Bhains 🐃",
      "Upar ke teeno 🤣"
    ],
    answer: 3,
    solution:
      "🤫 Secret fun question! Ye question score mein count nahi hota. 😂❤️"
  }
];


/* =========================================
   TEMPORARY RESULT STORAGE
========================================= */

let results = [];


/* =========================================
   QUESTIONS API
========================================= */

app.get("/api/questions", (req, res) => {

  const safeQuestions = questions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options
  }));

  res.json(safeQuestions);
});


/* =========================================
   SUBMIT API
   ONLY Q1-Q20 ARE SCORED
========================================= */

app.post("/api/submit", (req, res) => {

  try {

    const {
      name,
      answers,
      timeTaken
    } = req.body;

    if (!name || !Array.isArray(answers)) {

      return res.status(400).json({
        error: "Invalid submission."
      });

    }

    let score = 0;

    const review = questions.map(q => {

      const submitted = answers.find(
        a =>
          Number(a.questionId) === q.id
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
        selectedAnswer === q.answer;

      /*
       * IMPORTANT:
       * Q21 DOES NOT COUNT
       */

      if (
        q.id <= 20 &&
        isCorrect
      ) {

        score++;

      }

      return {

        questionId: q.id,

        question: q.question,

        options: q.options,

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
          q.options[q.answer],

        isCorrect,

        counted:
          q.id <= 20,

        solution:
          q.solution
      };

    });


    const result = {

      id:
        Date.now().toString(),

      name:
        String(name).substring(
          0,
          60
        ),

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


/* =========================================
   ADMIN RESULTS
========================================= */

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


/* =========================================
   PDF
========================================= */

function generatePDF(
  result,
  res
) {

  const doc =
    new PDFDocument({
      margin: 50,
      size: "A4"
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


  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .text(
      "KIRAN DIDI QUIZ",
      {
        align: "center"
      }
    );


  doc.moveDown();


  doc
    .fontSize(13)
    .font("Helvetica")
    .text(
      "Official Test Report",
      {
        align: "center"
      }
    );


  doc.moveDown();


  doc
    .fontSize(17)
    .font("Helvetica-Bold")
    .text(
      `Rank #1 — ${result.name}`,
      {
        align: "center"
      }
    );


  doc.moveDown();


  doc
    .fontSize(12)
    .font("Helvetica")
    .text(
      `Score: ${result.score}/20`
    );


  doc.text(
    `Percentage: ${result.percentage}%`
  );


  doc.text(
    `Time Taken: ${formatTime(
      result.timeTaken
    )}`
  );


  doc.text(
    `Submitted: ${new Date(
      result.submittedAt
    ).toLocaleString()}`
  );


  doc.moveDown();


  doc
    .fontSize(17)
    .font("Helvetica-Bold")
    .text(
      "ANSWER REVIEW"
    );


  doc.moveDown();


  result.review.forEach(
    (item, index) => {

      if (
        doc.y > 690
      ) {

        doc.addPage();

      }


      doc
        .fontSize(12)
        .font(
          "Helvetica-Bold"
        )
        .text(
          `Q${index + 1}. ${item.question}`
        );


      doc.moveDown(0.2);


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

          let marker = "";


          if (
            optionIndex ===
            item.correctAnswer
          ) {

            marker +=
              " [CORRECT]";

          }


          if (
            optionIndex ===
            item.selectedAnswer
          ) {

            marker +=
              " [YOUR ANSWER]";

          }


          doc
            .fontSize(10)
            .font("Helvetica")
            .text(
              `${letter}. ${option}${marker}`
            );

        }
      );


      doc.moveDown(0.2);


      doc
        .fontSize(10)
        .font(
          "Helvetica-Bold"
        )
        .text(
          "Your Answer:"
        );


      doc
        .font("Helvetica")
        .text(
          item.selectedText ===
          null
            ? "Not Attempted"
            : item.selectedText
        );


      doc
        .font(
          "Helvetica-Bold"
        )
        .text(
          "Correct Answer:"
        );


      doc
        .font("Helvetica")
        .text(
          item.correctText
        );


      if (
        item.questionId ===
        21
      ) {

        doc
          .font(
            "Helvetica-Bold"
          )
          .text(
            "Fun Question — Not Included in Score"
          );

      }


      doc
        .font(
          "Helvetica-Bold"
        )
        .text(
          "Solution:"
        );


      doc
        .font("Helvetica")
        .text(
          item.solution
        );


      doc.moveDown();


      doc
        .moveTo(
          50,
          doc.y
        )
        .lineTo(
          545,
          doc.y
        )
        .stroke();


      doc.moveDown();

    }
  );


  if (
    doc.y > 650
  ) {

    doc.addPage();

  }


  doc.moveDown();


  doc
    .fontSize(20)
    .font(
      "Helvetica-Bold"
    )
    .text(
      "CONGRATULATIONS!",
      {
        align: "center"
      }
    );


  doc.moveDown();


  doc
    .fontSize(13)
    .font("Helvetica")
    .text(
      "Kiran Didi officially secured Rank #1! 👑",
      {
        align: "center"
      }
    );


  doc.moveDown();


  doc
    .fontSize(16)
    .font(
      "Helvetica-Bold"
    )
    .text(
      "Didi Queen Award 👑",
      {
        align: "center"
      }
    );


  doc
    .fontSize(12)
    .font("Helvetica")
    .text(
      "Special Treat + Unlimited Appreciation ❤️",
      {
        align: "center"
      }
    );


  doc.end();

}


/* =========================================
   PDF ROUTE
========================================= */

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

    generatePDF(
      result,
      res
    );

  }
);


/* =========================================
   ADMIN PAGE
========================================= */

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

<title>
Kiran Didi Quiz Admin
</title>

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

input {
  width: 100%;
  padding: 14px;
  border: 1px solid #ccc;
  border-radius: 9px;
  font-size: 16px;
  margin-bottom: 12px;
}

button {
  background: #111;
  color: white;
  border: 0;
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
          📄 Download PDF
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
                    ? " — NOT COUNTED"
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


/* =========================================
   TIME FORMAT
========================================= */

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
    `${minutes}m ${remaining}s`
  );

}


/* =========================================
   START SERVER
========================================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `Kiran Didi Quiz running on port ${PORT}`
    );

  }
);
