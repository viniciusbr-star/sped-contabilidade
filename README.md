


# Site SPED Contabilidade (MVP)

Site institucional simples, com botão de WhatsApp como única forma de contato (sem área do cliente, sem backend).

## Como visualizar

Basta abrir o arquivo `index.html` no navegador (duplo clique) ou usar a extensão "Live Server" no VS Code.

## O que ajustar antes de publicar

1. **Número de WhatsApp**: já configurado em [js/script.js](js/script.js) na linha `WHATSAPP_NUMBER`. Troque se mudar o número.
2. **Logo**: coloque seu arquivo em `assets/img/logo.png` (ideal: fundo transparente, altura ~80px). Se o arquivo não existir, o site mostra automaticamente um logotipo em texto ("SPED Contabilidade").
3. **E-mail e endereço**: no rodapé de [index.html](index.html), troque `contato@spedcontabilidade.com.br` pelo e-mail real. Adicione endereço se quiser.
4. **Textos**: os textos de "Sobre" e dos serviços são genéricos — ajuste com informações reais do escritório (tempo de atuação, diferenciais específicos, etc.) sempre que tiver dados concretos, para não passar informação falsa.

## Como publicar (gratuito)

Qualquer uma dessas opções funciona sem precisar de servidor, porque o site é 100% estático (HTML/CSS/JS):

- **Netlify**: arraste a pasta `sped-contabilidade` em https://app.netlify.com/drop
- **Vercel**: `vercel` (CLI) dentro da pasta do projeto
- **GitHub Pages**: suba a pasta para um repositório e ative Pages nas configurações

## Depoimentos de clientes (Google Forms + Planilha, sem aparecer nada do Google)

A caixa "Deixe seu depoimento" no site é um formulário com a cara do site (não é um iframe do
Google). Quando o cliente envia, o JavaScript manda os dados escondido direto pro Google Form —
o visitante nunca vê a interface do Google. As respostas caem numa planilha, que o site lê
automaticamente pra exibir os depoimentos. Como isso funciona:

- `js/script.js` tem duas constantes de configuração: `GOOGLE_FORM_ACTION_URL` (URL de envio do
  form, terminada em `/formResponse`) e `GOOGLE_FORM_ENTRY_DEPOIMENTO` (o identificador
  `entry.XXXXXXXXX` do campo de depoimento dentro do Google Form). Já estão preenchidas com os
  valores do formulário atual (que tem só 1 pergunta, o depoimento em si).
- Se um dia você recriar o Google Form do zero (não só editar o existente), esses dois valores
  mudam e precisam ser atualizados: pegue a URL do formulário, troque `viewform` por
  `formResponse` no final para achar a `GOOGLE_FORM_ACTION_URL`, e peça pra localizar o novo
  `entry.XXXXXXXXX` do campo (abrindo o HTML da página do formulário e procurando por
  `FB_PUBLIC_LOAD_DATA_`).

Falta só ativar a **exibição automática** dos depoimentos já enviados:

1. Abra a planilha de respostas vinculada ao Google Form (aba **Respostas** do Form → ícone verde
   do Planilhas).
2. Na planilha, vá em **Arquivo → Compartilhar → Publicar na Web**, escolha a aba de respostas,
   formato **CSV**, e clique em **Publicar**.
3. Copie o link gerado (algo como `https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv`)
   e cole na constante `DEPOIMENTOS_SHEET_CSV_URL` em [js/script.js](js/script.js).

**Importante:** como não há moderação, qualquer pessoa que conseguir mandar uma requisição pro
endpoint do formulário pode publicar um depoimento direto no site. Se aparecer algo indevido, é
só apagar a linha correspondente na planilha de respostas — some do site na próxima visita.

## Próximos passos sugeridos (fora do MVP)

- Domínio próprio (ex: spedcontabilidade.com.br)
- Formulário de contato simples (além do WhatsApp)
- Depoimentos de clientes reais
- Blog/conteúdo para SEO
