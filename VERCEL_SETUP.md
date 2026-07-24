# Vercel Deployment Setup Instructions

To securely use the Gemini API on the hosted version (`bcs702.vercel.app`) without exposing your API key to students, follow these steps:

## Step 1: Push Changes to GitHub
Since your project is connected to Vercel, push the updated files to your GitHub repository:
- `index.html` (updated to call the proxy endpoint)
- `api/explain.js` (new Vercel serverless function)

Once pushed, Vercel will automatically detect the changes and deploy them.

## Step 2: Configure your API Key on Vercel
1. Go to your **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Select your project: **`BCS702`**.
3. Navigate to **Settings** > **Environment Variables**.
4. Add a new environment variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `Your_Gemini_API_Key_Here`
5. Select all environments (**Production**, **Preview**, **Development**).
6. Click **Save**.

## Step 3: Redeploy (if needed)
If Vercel does not automatically pick up the new environment variable, go to your project's **Deployments** tab, click on the three dots `...` next to the latest deployment, and select **Redeploy**.

---

### How it works now:
- **For Students:** The site now sends request to `bcs702.vercel.app/api/explain`. Vercel processes the request on the server, attaches your key securely, fetches the answer from Gemini, and returns the text back. Your key is **never** sent to the student's browser.
- **For Local Development:** If you run the page locally (`file:///` or `localhost`), the serverless function won't be running. In that case, you can click the **Gemini Config** button in the top-right corner to set a temporary developer API key stored locally in your browser only.
