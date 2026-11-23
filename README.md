# Nuxt SaaS Template

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

Fully built SaaS application to launch your next project with a landing page, a pricing page, a documentation and a blog powered by [Nuxt UI](https://ui.nuxt.com) components.

- [Live demo](https://saas-template.nuxt.dev/)
- [Documentation](https://ui.nuxt.com/docs/getting-started/installation/nuxt)

<a href="https://saas-template.nuxt.dev/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://ui.nuxt.com/assets/templates/nuxt/saas-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://ui.nuxt.com/assets/templates/nuxt/saas-light.png">
    <img alt="Nuxt SaaS Template" src="https://ui.nuxt.com/assets/templates/nuxt/saas-light.png">
  </picture>
</a>

## Quick Start

```bash [Terminal]
npm create nuxt@latest -- -t ui/saas
```

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-name=saas&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fsaas&demo-image=https%3A%2F%2Fui.nuxt.com%2Fassets%2Ftemplates%2Fnuxt%2Fsaas-dark.png&demo-url=https%3A%2F%2Fsaas-template.nuxt.dev%2F&demo-title=Nuxt%20SaaS%20Template&demo-description=A%20SaaS%20template%20with%20landing%2C%20pricing%2C%20docs%20and%20blog%20powered%20by%20Nuxt%20Content.)

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Google authentication

Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as server-only Cloudflare
bindings alongside `BETTER_AUTH_SECRET`. For local development, put these values
in the gitignored `.dev.vars` file; configure the corresponding bindings/secrets
in Cloudflare for production. Do not expose the client secret in public runtime
configuration.

In the Google Cloud Console, use a **Web application** OAuth client and add these
**Authorized redirect URIs**:

- Local development: `http://localhost:3555/api/auth/callback/google`
- Production: `https://<your-domain>/api/auth/callback/google`

The origin must match the URL used to access the application. If the Google OAuth
consent screen is in testing mode, add the accounts you want to use as test users.
The Google button on both login and signup starts the same OAuth flow: new users
are registered automatically, and existing users are signed in.

## YouTube video metadata

Enable **YouTube Data API v3** in Google Cloud and restrict the API key to that
API. Set `YOUTUBE_API_KEY` in the local `.env` file and configure it as a
server-side Cloudflare Pages secret for deployed environments. The artist video
editor uses it to fetch the title, description, thumbnail, and duration.
The endpoint returns `duration` in ISO 8601 format (for example, `PT3M42S`).
The video editor shows it on each video card as `3:42`, or `1:02:05` for a video
lasting an hour or more.
The key is not sent to the browser.

## Production

Uploaded artist images are served from R2 through `/images/<pathname>`.
Their previews use Nuxt Image's `none` provider to load this endpoint directly:
the default IPX filesystem source cannot read blobs stored in R2.
The `none` provider is registered through `image.none` in `nuxt.config.ts`;
IPX remains the default for other images.

Artist profile images are stored in R2 at `<artistId>/<filename>`. The
`artists.avatar` and `artists.hero` columns hold only the filenames; new uploads
use `<uuid>.webp`. Apply the `0005_artist_profile_images` D1 migration before
deploying. It moves local `pictures.avatar` and `pictures.header` references to
the new columns without renaming existing files. External URLs aren't migrated;
re-upload those images if needed.

Deleting an avatar or hero image from the artist editor clears its column
immediately and removes the blob from R2 unless the other profile image still
references that file.

User profiles use `name` (the `nickname` field has been removed). Signup collects
name, email, password, and optional location. Language (`hu` by default) and theme
(`light`, `dark`, or `system`, defaulting to `system`) are edited in Settings
or by admins in the user editor. The admin user list also displays language.
The saved theme is applied when signing in and after saving Settings.

Apply the `0004_user_preferences` D1 migration before deploying these profile
changes. Existing names, locations, and languages are preserved; nicknames are
deleted and existing users receive the `system` theme.

Artist links are stored in `artists.links` as a JSON array of
`{ platform, url }` objects. Array order is display order; reordering only requires
saving the reordered array, not a separate position field.

The artist profile form lets editors search and select related artists by name.
The selected artist IDs are stored as a JSON array in `artists.connections`.
Public artist profiles display active connections in saved order as linked
avatars next to the external links.

Apply the `0003_artist_link_objects` D1 migration before deploying the new link
format. It preserves existing URLs and their order, assigning `site` to legacy
string links because their original platforms were not stored. Already structured
links are left unchanged.

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Renovate integration

Install [Renovate GitHub app](https://github.com/apps/renovate/installations/select_target) on your repository and you are good to go.
