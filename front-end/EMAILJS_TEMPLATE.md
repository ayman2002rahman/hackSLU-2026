# EmailJS Template Setup (contact_form)

The Send Orders page sends the purchase order to the vendor using EmailJS with **service id** `service_frdp939` and **template id** `contact_form`.

## 1. Get your EmailJS User ID

In [EmailJS Dashboard](https://dashboard.emailjs.com/) → Account → API Keys, copy your **Public Key** (User ID). Add it to your app:

- Create `front-end/.env` and add:
  ```
  VITE_EMAILJS_USER_ID=your_public_key_here
  ```
- Restart the dev server after changing `.env`.

## 2. Template variables the app sends

The app sends these template parameters. Use them in your EmailJS template (template id: `contact_form`) as needed:

| Variable | Description |
|----------|-------------|
| `to_email` | Vendor email address |
| `vendor_email` | Same as above (for reply-to or display) |
| `order_notes` | Optional notes from the form |
| `total_items` | Number of distinct products |
| `total_units` | Total quantity across all items |
| `total_cost` | Formatted total (e.g. $1,234.56) |
| `order_items_text` | Plain-text list of lines: `Product: qty × $x = $y` |
| `order_summary_html` | **Full HTML** that matches the website order summary |

## 3. Sending to the vendor

In the EmailJS template settings, set **To Email** to `{{to_email}}` so the purchase order is sent to the address the user entered (Vendor Email on the page).

## 4. Making the email look like the website summary

To show the **same look as the Order Summary** on the site, use the pre-built HTML in your template:

1. In EmailJS → Email Templates → edit **contact_form**.
2. Set the email **Content** to HTML (not plain text).
3. In the body, use **triple curly brackets** so HTML is not escaped:

   ```
   {{{order_summary_html}}}
   ```

   That block includes:
   - Title “Order Summary” and subtitle
   - Gray box with **Total Items**, **Total Units**, and **Total Order Cost**
   - “Items in order:” with a table of product name and “qty × cost = total”
   - Order notes (if any)

### Minimal HTML template example (Body)

Subject (optional, can use a variable later):

```
Purchase Order - {{total_items}} items
```

Body (HTML):

```html
<p>Please find below the purchase order.</p>
{{{order_summary_html}}}
<p>Vendor email: {{vendor_email}}</p>
```

### If you prefer plain text only

You can ignore `order_summary_html` and use:

- `{{total_items}}`, `{{total_units}}`, `{{total_cost}}`
- `{{order_notes}}`
- `{{order_items_text}}` (multi-line text list)

The formatted “same way the summary looks” experience comes from using `{{{order_summary_html}}}` in an HTML email.
