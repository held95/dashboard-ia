export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { dados } = req.body;

  try {
    const resposta = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [
          { role: "system", content: "Você é um analista de dados que gera conclusões objetivas e úteis." },
          { role: "user", content: `Analise os seguintes dados: ${dados}` }
        ]
      })
    });

    if (!resposta.ok) {
      const text = await resposta.text();
      return res.status(500).json({ error: "Erro na Mistral", details: text });
    }

    const data = await resposta.json();
    return res.status(200).json({ insights: data.choices[0].message.content });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao conectar na Mistral", details: err.message });
  }
}
