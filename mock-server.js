const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

// 임시 스토리지 (실제로는 데이터베이스 사용)
const conversations = new Map();

// 모의 명언 데이터
const quotes = [
  {
    id: "1",
    text: "가장 어두운 밤도 결국은 끝나고, 해는 떠오른다.",
    author: "빅터 위고",
    category: "hope",
  },
  {
    id: "2",
    text: "실패는 성공의 어머니다.",
    author: "토마스 에디슨",
    category: "motivation",
  },
  {
    id: "3",
    text: "오늘 할 수 있는 일을 내일로 미루지 말라.",
    author: "벤자민 프랭클린",
    category: "productivity",
  },
  {
    id: "4",
    text: "넘어지는 것은 실패가 아니다. 넘어진 자리에 머무는 것이 실패다.",
    author: "공자",
    category: "resilience",
  },
];

// 봇 응답 생성
const generateBotResponse = (step, userMessage) => {
  const responses = [
    `안녕하세요! ${userMessage}에 대해 말씀해주셔서 감사합니다. 더 자세히 들려주실 수 있나요?`,
    `그런 상황이셨군요. 정말 힘드셨을 것 같아요. 그때 어떤 기분이 드셨나요?`,
    `마음이 많이 상하셨을 것 같아요. 이런 일들이 있을 때는 정말 지치죠. 조금 더 이야기해주세요.`,
    `충분히 이해됩니다. 당신의 마음을 어루만져줄 수 있는 따뜻한 말을 전해드릴게요.`,
  ];

  return responses[step] || responses[responses.length - 1];
};

// 1. 메시지 전송 API
app.post("/api/chat/send", async (req, res) => {
  try {
    const { userId, threadNum, content, timestamp } = req.body;

    if (!userId || !threadNum || !content) {
      return res.status(400).json({
        error: "필수 필드가 누락되었습니다.",
      });
    }

    // 대화 정보 저장/업데이트
    const conversationKey = `${userId}_${threadNum}`;
    const conversation = conversations.get(conversationKey) || {
      messages: [],
      step: 0,
      status: "active",
    };

    conversation.messages.push({
      content,
      timestamp,
      isUser: true,
    });

    const currentStep = conversation.step;

    // 4단계 이후면 명언 생성
    if (currentStep >= 3) {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      const botResponse = generateBotResponse(currentStep, content);

      conversation.messages.push({
        content: botResponse,
        timestamp: new Date().toISOString(),
        isUser: false,
      });

      conversation.step++;
      conversation.status = "completed";
      conversations.set(conversationKey, conversation);

      return res.json({
        userId,
        threadNum,
        timestamp: new Date().toISOString(),
        status: "completed",
        content: botResponse,
        quote: randomQuote,
      });
    } else {
      // pending 상태로 응답
      conversation.step++;
      conversation.status = "pending";
      conversations.set(conversationKey, conversation);

      return res.json({
        userId,
        threadNum,
        timestamp: new Date().toISOString(),
        status: "pending",
      });
    }
  } catch (error) {
    console.error("Error in /api/chat/send:", error);
    res.status(500).json({
      error: "서버 내부 오류가 발생했습니다.",
    });
  }
});

// 2. 상태 확인 API
app.get("/api/chat/status", async (req, res) => {
  try {
    const { userId, threadNum } = req.query;

    if (!userId || !threadNum) {
      return res.status(400).json({
        error: "필수 파라미터가 누락되었습니다.",
      });
    }

    const conversationKey = `${userId}_${threadNum}`;
    const conversation = conversations.get(conversationKey);

    if (!conversation) {
      return res.status(404).json({
        error: "대화를 찾을 수 없습니다.",
      });
    }

    // 2초 후 응답 생성 시뮬레이션
    setTimeout(() => {
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      const botResponse = generateBotResponse(conversation.step - 1, lastMessage?.content || "");
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

      conversation.messages.push({
        content: botResponse,
        timestamp: new Date().toISOString(),
        isUser: false,
      });

      if (conversation.step >= 4) {
        conversation.status = "completed";

        res.json({
          userId,
          threadNum,
          timestamp: new Date().toISOString(),
          status: "completed",
          content: botResponse,
          quote: randomQuote,
        });
      } else {
        res.json({
          userId,
          threadNum,
          timestamp: new Date().toISOString(),
          status: "completed",
          content: botResponse,
        });
      }
    }, 2000);
  } catch (error) {
    console.error("Error in /api/chat/status:", error);
    res.status(500).json({
      error: "서버 내부 오류가 발생했습니다.",
    });
  }
});

// 3. 스트리밍 API
app.get("/api/chat/stream", (req, res) => {
  const { userId, threadNum } = req.query;

  if (!userId || !threadNum) {
    return res.status(400).json({
      error: "필수 파라미터가 누락되었습니다.",
    });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const conversationKey = `${userId}_${threadNum}`;
  const conversation = conversations.get(conversationKey);

  if (!conversation) {
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        data: "대화를 찾을 수 없습니다.",
        timestamp: new Date().toISOString(),
      })}\n\n`,
    );
    res.end();
    return;
  }

  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const botResponse = generateBotResponse(conversation.step - 1, lastMessage?.content || "");
  const words = botResponse.split(" ");
  let wordIndex = 0;

  // 단어별로 스트리밍
  const streamInterval = setInterval(() => {
    if (wordIndex < words.length) {
      const chunk = {
        type: "content",
        data: wordIndex === 0 ? words[wordIndex] : ` ${words[wordIndex]}`,
        timestamp: new Date().toISOString(),
      };

      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      wordIndex++;
    } else {
      clearInterval(streamInterval);

      // 명언 전송 (4단계 이후)
      if (conversation.step >= 4) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        const quoteChunk = {
          type: "quote",
          data: JSON.stringify(randomQuote),
          timestamp: new Date().toISOString(),
        };

        res.write(`data: ${JSON.stringify(quoteChunk)}\n\n`);
      }

      // 완료 신호
      const completeChunk = {
        type: "complete",
        data: "",
        timestamp: new Date().toISOString(),
      };

      res.write(`data: ${JSON.stringify(completeChunk)}\n\n`);
      res.end();
    }
  }, 100); // 100ms 간격으로 단어 전송

  // 클라이언트 연결 해제 시 정리
  req.on("close", () => {
    clearInterval(streamInterval);
  });
});

// 상태 확인 엔드포인트
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    activeConversations: conversations.size,
  });
});

// 대화 리셋 엔드포인트 (개발용)
app.delete("/api/chat/:userId/:threadNum", (req, res) => {
  const { userId, threadNum } = req.params;
  const conversationKey = `${userId}_${threadNum}`;

  if (conversations.has(conversationKey)) {
    conversations.delete(conversationKey);
    res.json({ message: "대화가 삭제되었습니다." });
  } else {
    res.status(404).json({ error: "대화를 찾을 수 없습니다." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 모의 API 서버가 http://localhost:${PORT}에서 실행 중입니다.`);
  console.log(`📝 API 문서: http://localhost:${PORT}/api/health`);
  console.log(`💬 활성 대화 수: ${conversations.size}`);
});

module.exports = app;
