import 'dotenv/config'
import { Client, GatewayIntentBits, ActivityType } from 'discord.js'
import axios from 'axios'

const DISCORD_TOKEN = process.env.DISCORD_TOKEN
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const MODELSLAB_API_KEY = process.env.MODELSLAB_API_KEY

if (!DISCORD_TOKEN) throw new Error("Missing DISCORD_TOKEN")

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

async function googleSearch(query) {
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}`

  const res = await axios.get(url)

  if (!res.data.items) return "No results found."

  return res.data.items
    .slice(0, 3)
    .map(r => `${r.title}\n${r.link}`)
    .join("\n\n")
}

async function askAI(prompt) {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are BloodEclipse AI. You are sarcastic, savage, witty, and helpful."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  )

  return response.data.choices[0].message.content
}

async function generateImage(prompt) {
  const response = await axios.post(
    "https://modelslab.com/api/v6/images/text2img",
    {
      key: MODELSLAB_API_KEY,
      prompt: prompt,
      width: 512,
      height: 512,
      samples: 1,
      num_inference_steps: 25
    }
  )

  return response.data.output[0]
}

client.on("messageCreate", async message => {
  if (message.author.bot) return

  if (message.content.startsWith("!search ")) {
    const query = message.content.replace("!search ", "")

    const results = await googleSearch(query)

    message.reply(`🔎 **Search Results**\n\n${results}`)
  }

  if (message.content.startsWith("!ask ")) {
    const question = message.content.replace("!ask ", "")

    const reply = await askAI(question)

    message.reply(reply.substring(0, 2000))
  }

  if (message.content.startsWith("!imagine ")) {
    const prompt = message.content.replace("!imagine ", "")

    const image = await generateImage(prompt)

    message.reply({
      content: `🎨 ${prompt}`,
      files: [image]
    })
  }

  if (message.content === "!roast") {
    const roast = await askAI("Roast someone brutally in one sentence.")

    message.reply(roast)
  }
})

client.once("ready", () => {
  console.log(`🔥 Logged in as ${client.user.tag}`)

  client.user.setActivity("BloodEclipse Guild", {
    type: ActivityType.Playing
  })
})

client.login(DISCORD_TOKEN)
