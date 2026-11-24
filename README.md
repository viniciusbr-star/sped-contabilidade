


# Site SPED Contabilidade (MVP)

Site institucional simples, com botão de WhatsApp como única forma de contato (sem área do cliente, sem backend).

## Como visualizar

Basta abrir o arquivo `index.html` no navegador (duplo clique) ou usar a extensão "Live Server" no VS Code.

## O que ajustar antes de publicar

1. **Número de WhatsApp**: já configurado em [js/script.js](js/script.js) na linha `WHATSAPP_NUMBER`. Troque se mudar o número.
2. **Logo**: coloque seu arquivo em `assets/img/logo.png` (ideal: fundo transparente, altura ~80px). Se o arquivo não existir, o site mostra automaticamente um logotipo em texto ("SPED Contabilidade").
3. **E-mail e endereço**: no rodapé de [index.html](index.html), troque `contato@spedcontabilidade.com.br` pelo e-mail real. Adicione endereço se quiser.
4. **Textos**: os textos de "Sobre" e dos serviços são genéricos — ajuste com informações reais do escritório (tempo de atuação, diferenciais específicos, etc.) sempre que tiver dados concretos, para não passar informação falsa.

## Como publicar e aparecer no Google

O site é 100% estático, então fica hospedado **de graça no GitHub Pages**, e cada atualização
do Radar Fiscal publicada na `main` vai ao ar sozinha.

1. **Registrar o domínio** `spedcontabilidade.com.br` em https://registro.br (cerca de R$ 40/ano).
   Se registrar outro nome, troque `spedcontabilidade.com.br` em `index.html`, `obras.html`,
   `robots.txt` e `sitemap.xml`.
2. **Ativar o GitHub Pages**: no repositório, *Settings → Pages → Source: Deploy from a branch →
   Branch: `main` / `(root)` → Save*. Em ~1 minuto o site fica em
   `https://viniciusbr-star.github.io/sped-contabilidade/`.
3. **Apontar o domínio** (no painel do registro.br, aba DNS → "Editar zona"):
   - 4 registros **A** para `spedcontabilidade.com.br`: `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - 1 registro **CNAME** para `www` apontando para `viniciusbr-star.github.io`
4. **Ligar o domínio no GitHub**: *Settings → Pages → Custom domain* → `spedcontabilidade.com.br` →
   Save. Quando aparecer o check verde, marque **Enforce HTTPS**.
5. **Avisar o Google**: em https://search.google.com/search-console adicione a propriedade
   do domínio, confirme com o registro TXT que ele pedir (no DNS do registro.br) e, em *Sitemaps*,
   envie `sitemap.xml`. Depois use *Inspeção de URL → Solicitar indexação* na página inicial.
6. **Perfil da Empresa no Google** (o que mais traz cliente local): cadastre o escritório em
   https://business.google.com com o mesmo endereço, telefone e o link do site. É ele que faz a
   SPED aparecer no mapa quando alguém busca "contabilidade em Osvaldo Cruz".

O Google costuma levar de alguns dias a algumas semanas para começar a mostrar o site.

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

## Página de Regularização de Obras

`obras.html` é uma página independente focada em regularização de obras (CNO, SERO, INSS de obra e CND).
Usa o mesmo `css/style.css` do site, mais os estilos próprios em `css/obras.css`. O formulário de
diagnóstico monta uma mensagem e abre o WhatsApp (código em `js/script.js`, seção "Diagnóstico de obra").

## Radar Fiscal (atualização automática)

A seção "Radar Fiscal" da página inicial lê o arquivo `data/radar.json`. Esse arquivo é atualizado todo
dia útil por uma rotina agendada do Claude ("Radar Fiscal – Site", em https://claude.ai/code/routines),
que pesquisa as novidades em fontes oficiais, reescreve o JSON e faz push na branch `main`. Como o site
está hospedado ligado ao GitHub, cada push publica a versão nova automaticamente.

- Se o arquivo estiver vazio, a seção mostra a mensagem "O Radar Fiscal está sendo preparado".
- Abrindo o `index.html` direto do computador (duplo clique) o navegador bloqueia a leitura do JSON; para
  ver o Radar localmente use o "Live Server" do VS Code.
- Formato de cada item: `data` (AAAA-MM-DD), `area`, `titulo`, `resumo`, `quem_e_afetado`, `fonte`, `link`.
