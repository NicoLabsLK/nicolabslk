# Nico Labs website

Static site: plain HTML, CSS and JS. No build step.

- `index.html` – the page
- `styles.css` – all styling
- `main.js` – scroll effects and the "Request a call back" form
- `assets/` – logo and founder photo

The call form doesn't need a server. It opens WhatsApp with the visitor's details filled in, sent to the number in `WHATSAPP_NUMBER` at the top of `main.js`.

## Run locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publish on GitHub Pages (free)

For the cleanest free URL, `https://nicolabs.github.io`:

1. Create a free GitHub organization called `nicolabs` (or any free name).
2. In it, create a public repo named exactly `nicolabs.github.io`.
3. Push these files to the `main` branch.
4. Repo → Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.

Pushing to a repo with any other name under your own account gives `https://hirund.github.io/<repo-name>/` instead. That works too, just a longer URL.
