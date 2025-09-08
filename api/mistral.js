// pages/api/gerar-insight.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { dados } = req.body;

  if (!dados) {
    return res.status(400).json({ error: "Nenhum dado fornecido" });
  }

  if (!process.env.MISTRAL_API_KEY) {
    return res.status(500).json({ error: "Chave da Mistral não encontrada" });
  }

  try {
    const resposta = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-small", // use o modelo correto
        messages: [
          {
            role: "system",
            content: "Você é um analista de dados que gera conclusões objetivas e úteis."
          },
          {
            role: "user",
            content: `Analise os seguintes dados: ${dados}`
          }
        ],
      }),
    });

    if (!resposta.ok) {
      const text = await resposta.text();
      return res.status(500).json({ error: "Erro na Mistral", details: text });
    }

    const data = await resposta.json();

    // Segurança: checa se existe a resposta esperada
    const insight = data?.choices?.[0]?.message?.content || "Nenhum insight gerado";
    return res.status(200).json({ insights: insight });

  } catch (err) {
    return res.status(500).json({ error: "Erro ao conectar na Mistral", details: err.message });
  }
}
