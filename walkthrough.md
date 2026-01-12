# Business Ideas Coach - Verification Walkthrough

This guide details how to verify the new "Business Ideas for Beginners Coach" feature in Veta.

## 1. Prerequisites
- Ensure `OPENAI_API_KEY` is set in your `.env.local` or environment.
- Run the development server: `npm run dev`.
- Ensure you are logged in (or using a dev setup that bypasses auth if applicable, otherwise sign in).

## 2. Accessing the Coach
1. **Navigate to the Dashboard** where analyzed problems are listed.
2. **Select a Problem**: Click on a problem card (or expand one).
3. **Locate the Action Button**: In the "Actions" row (bottom of card), look for the button **"Convertir en negocio"** (Convert to Business).
4. **Click the Button**: It should open the **CoachDrawer** sliding in from the right.

## 3. Verifying User Context (if applicable)
- *Scenario A*: If you have not provided skills/access before (or checking logic), you SHOULD see a **"Personaliza tu Coach"** screen inside the drawer first.
    - **Test Input**: Enter "Marketing digital" in skills and "Dueños de PYMES" in access.
    - **Click "Comenzar"**: The form should disappear and show the Chat interface.
- *Scenario B*: If you click "Saltar este paso", it should proceed immediately to Chat with empty context.

## 4. Testing the Chat (Streaming)
1. **Initial Message**: Verify the AI greets you referencing the specific problem title you clicked.
    - *Expected*: "Hola! He analizado el problema '[Problem Title]'..."
2. **Send a Message**: Type "Dame una idea de oferta rapida" and hit Enter.
3. **Observe Streaming**: The response should stream in token-by-token (real-time typing effect).
4. **Check Quality**: The answer should be relevant to the problem and your (optional) context.

## 5. Testing Offer Generation
1. **Switch Tabs**: Click the **"OFERTAS"** (Offers) tab at the top of the drawer.
2. **Empty State**: You should see the "Generar Ofertas High-Ticket" empty state.
3. **Click "Generar 3-5 Ofertas"**.
4. **Loading State**: Verify the loading spinner and "Diseñando ofertas rentables..." text appear.
5. **Results**: After a few seconds, 3-5 **Offer Cards** should appear.
    - **Check Content**: Prices should be in USD ($2k+), timeline ~4-12 weeks, with specific deliverables.
    - **Recommended**: One offer should be highlighted as "RECOMMENDED".
6. **Copy Buttons**: Click "Copiar Outreach" and "Copiar Preguntas" on a card. Verify a checkmark appears and the content is copied to your clipboard.

## 6. Closing & Responsiveness
1. **Close Drawer**: Click the 'X' icon or the backdrop. The drawer should close smoothly.
2. **Mobile Check**: Resize browser to mobile width (<768px). Open the drawer again. It should cover 100% width (or near it) and look native.

## 7. Troubleshooting
- **401/500 Errors**: Check your server console. `OPENAI_API_KEY` missing is the most common cause.
- **Lint Errors in Console**: We fixed `no-explicit-any` errors, so the build should be clean.
