<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-Edge_Functions-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" />
</p>

# ✈️ Onhappy — Planejamento Inteligente de Viagens a Lazer

> Uma plataforma que transforma o fluxo tradicional de busca fragmentada em um **assistente guiado com IA** que entende o perfil do viajante e entrega voos + hotéis recomendados em uma única experiência.

---

## 🎯 O Problema

Portais de viagem tradicionais oferecem interfaces segmentadas e genéricas: o usuário precisa buscar voos em uma tela, hotéis em outra, sem contexto sobre suas preferências reais. Não existe personalização, não existe inteligência — apenas formulários repetitivos que ignoram quem é o viajante.

## 💡 A Solução

O Onhappy substitui esse fluxo por um **wizard interativo** que coleta preferências de forma natural — destino, orçamento, companhia, tipo de hospedagem, proximidade de praia, vida noturna — e usa **inteligência artificial** para:

- 🧠 Gerar perguntas contextuais baseadas no perfil do viajante
- 🏖️ Detectar automaticamente se o destino é litorâneo
- 📊 Analisar sazonalidade e recomendar o melhor período
- ⭐ Destacar os **Top hotéis e voos** com justificativas personalizadas
- ✅ Validar as seleções contra o orçamento e preferências definidas

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│         React + TypeScript + Vite            │
│        Tailwind CSS + shadcn/ui              │
│         Framer Motion (animações)            │
├─────────────────────────────────────────────┤
│              Estado Global                   │
│           React Context API                  │
│         TanStack Query (cache)               │
├─────────────────────────────────────────────┤
│           Supabase Edge Functions            │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ search-  │ │ search-  │ │ ai-recommend │ │
│  │ flights  │ │ hotels   │ │              │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ detect-  │ │ suggest- │ │  validate-   │ │
│  │ coastal  │ │questions │ │  selections  │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
│  ┌──────────────────┐                        │
│  │ analyze-seasons  │                        │
│  └──────────────────┘                        │
├─────────────────────────────────────────────┤
│              APIs Externas                   │
│    SerpAPI (voos/hotéis) · Groq AI (LLM)    │
└─────────────────────────────────────────────┘
```

---

## 🚀 Funcionalidades

### Wizard Inteligente
- **Destino** com autocomplete (Nominatim/OpenStreetMap)
- **Período** com análise de sazonalidade por IA
- **Companheiros** e idades dos viajantes
- **Orçamento** flexível (por dia ou total)
- **Tipo de hospedagem** e estrelas mínimas
- **Preferências** de praia, vida noturna, voos
- **Perguntas dinâmicas** geradas por IA com base no perfil

### Resultados com IA
- 🏆 **Top 2 voos** e **Top 3 hotéis** destacados como recomendações
- Justificativa personalizada para cada sugestão
- Filtros por preço, estrelas, paradas, duração
- Carrinho de viagem com validação inteligente
- Drawer de reserva com link de afiliado

---

## 📦 Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 18, TypeScript 5, Vite 5 |
| **Estilização** | Tailwind CSS 3, shadcn/ui, Framer Motion |
| **Estado** | React Context, TanStack Query |
| **Backend** | Supabase Edge Functions (Deno) |
| **IA** | Groq API (Llama 3.1 / 3.3) |
| **Dados** | SerpAPI (voos e hotéis) |
| **Geolocalização** | Nominatim (OpenStreetMap) |

---

## ⚙️ Configuração

### Pré-requisitos

- Node.js 18+
- npm ou bun

### Instalação

```bash
git clone https://github.com/seu-usuario/onhappy.git
cd onhappy
npm install
npm run dev
```

### Variáveis de Ambiente

O projeto utiliza Supabase Edge Functions com as seguintes secrets configuradas no backend:

| Secret | Descrição |
|--------|-----------|
| `SERPAPI_KEY` | Chave da SerpAPI para busca de voos e hotéis |
| `GROQ_API_KEY` | Chave da Groq para funcionalidades de IA |

---

## 📂 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── wizard/            # Steps do wizard de viagem
│   ├── results/           # Cards de voo, hotel, carrinho
│   ├── Navbar.tsx
│   ├── SearchHero.tsx
│   └── ...
├── contexts/
│   └── SearchContext.tsx   # Estado global da busca
├── pages/
│   ├── Index.tsx           # Landing page
│   ├── Wizard.tsx          # Wizard de preferências
│   ├── Results.tsx         # Resultados com IA
│   └── NotFound.tsx
├── hooks/
├── lib/
└── main.tsx

supabase/functions/
├── ai-recommend/           # Ranking IA de resultados
├── analyze-seasons/        # Análise de sazonalidade
├── detect-coastal/         # Detecção de cidade litorânea
├── search-flights/         # Proxy SerpAPI (voos)
├── search-hotels/          # Proxy SerpAPI (hotéis)
├── suggest-questions/      # Perguntas dinâmicas por IA
└── validate-selections/    # Validação de seleções
```

---

## 🧪 Testes

```bash
npm run test
```

---

## 👥 Time

Desenvolvido durante hackathon como prova de conceito para transformar a experiência de viagens a lazer.

---

<p align="center">
  Feito com ❤️ e muita IA
</p>
