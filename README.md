# LLM - Social Engineering CTF Challenge

This is a proof-of-concept application that utilizes the [OpenAI API](https://beta.openai.com/) to embed the secrets of a LLM's knowledge.



<!-- add image here -->
![LLM](thumnail.png)

This application is a social engineering CTF challenge that requires players to utilize the information provided by the LLM in order to access the concealed flag. My aim in developing this challenge was to draw attention to the potential privacy issues that can arise from using LLM technology, including the risk of exposing sensitive user information through trained data or data used to answer queries.

Wishing you all a productive hacking experience! 🍻

**🍿 Live preview**: https://llm.nhtlongcs.com

<!-- > ⚠️ Notice: Our API Key limit has been exhausted. So the demo site is not available now. -->


## Pre environment
1. **Node**: Check that both your development environment and deployment environment are using `Node v18` or later. You can use [nvm](https://github.com/nvm-sh/nvm) to manage multiple `node` versions locally。
   ```bash
    node -v
   ```
2. **OPENAI_API_KEY**: Before running this application, you need to obtain the API key from OpenAI. You can register the API key at [https://beta.openai.com/signup](https://beta.openai.com/signup).

## Getting Started

1. Install dependencies
```bash
   npm install
```
2. Copy the `.env.example` file, then rename it to `.env`, and add your [OpenAI API key](https://platform.openai.com/account/api-keys) to the `.env` file.
```bash
   OPENAI_API_KEY=sk-xxx...
```
3. Run the application, the local project runs on `http://0.0.0.0:3000/`
```bash
   npm run dev -- --host 0.0.0.0 --port 3000
```


## Acknowledgements

This repository is a modified version of the `ChatGPT-demo` developed by [Diu](https://github.com/ddiu8081), which can be found on GitHub at https://github.com/anse-app/chatgpt-demo. I would like to express my gratitude to Diu for his remarkable work and for sharing it with the public. The original concept for this project was inspired by a previous work, which unfortunately is no longer accessible at https://socialengineer.vercel.app.