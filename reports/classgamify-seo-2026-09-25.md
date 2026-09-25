# ClassGamify search visibility review — 2026-09-25

## Evidence and limits

The Google Search Console domain property `classgamify.com` showed 6 clicks, 200 impressions, 3.0% CTR, and average position 33.3 for 2026-06-24 through 2026-09-23. The last 28 days (2026-08-27 through 2026-09-23) showed 4 clicks, 70 impressions, 5.7% CTR, and average position 29.3. These are Search Console observations, not keyword search-volume estimates.

Google had indexed 146 pages and excluded 105. The exclusion list included 39 alternate canonical URLs, 21 robots-blocked URLs, 19 where Google chose another canonical, 10 redirects, 10 not found URLs, 5 discovered but not indexed URLs, and 1 soft 404. Those categories do not mean 105 broken public pages: private paths and canonical alternatives are expected in part. The sitemap was reachable and listed 170 URLs at the start of this review.

Search Console showed impressions for `classroom game templates`, `game generator for teachers`, and `create a review game`, although the visible query rows were sparse. The top sampled pages over three months were `/` (4 clicks, 28 impressions), `/blog` (1, 47), `/es/templates` (1, 2), `/teachers` (0, 23), `/templates` (0, 18), and `/worksheets` (0, 12). These observations do not support the claim that the main topic has zero demand. They do show low exposure and rankings that leave most searches without a click. Public search results also contain teacher game makers such as [Classroomscreen](https://classroomscreen.com/blog/free-classroomscreen-games-teachers) and [Microsoft's matching game](https://support.microsoft.com/en-us/teams/education/create-matching-game-with-ai), which confirms active competition but does not establish monthly query volume.

This review did not run a current PageSpeed Insights audit because no API key was available. The older HTML report in this repository is dated 2026-08-06 and is not used as current performance evidence.

## Confirmed causes

1. **Search intent is too broad on the main entry pages.** The original homepage title emphasized an “AI-ready classroom activity platform.” Its first screen led with generic workflow signals, while the actual student experience appeared farther down. Template cards were text heavy and did not let a teacher quickly see an example. Searchers looking for a quiz or matching game lacked a focused entry page showing what they can make and try.
2. **Many localized URLs had no localized primary content.** Only English and Chinese blog posts exist, but the sitemap exposed 10 language versions of the blog index and four post URLs. Other-language blog detail URLs served English bodies under self canonicals. On the live site, representative French, Japanese, and Spanish `/create`, `/pricing`, `/contact`, and `/roadmap` pages contained substantial English text; all non-English legal pages served English Markdown bodies. This creates weak or duplicate international search entries. Google's [canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) and [multilingual guidance](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites) support aligning indexed URLs and language annotations with substantive translated content.
3. **The guest path gave a misleading save impression.** A visitor could edit a scaffold before signing in, but that draft was not restored after login. This added friction at the point a teacher decides whether to build an activity.
4. **Old route-shaped URLs remained in the 404 sample.** Search Console listed paths such as `/(pages)/about`, `/(pages)/contact/contact`, and `/blog/$slug`. Existing redirects covered several other historical paths; these missed paths can be consolidated to their public destinations.

## Changes in this update

- Publish English classroom quiz and matching game guides with actual starter content, template entry links, and a real student quiz link where applicable.
- Move the homepage activity preview and live demo action into the first screen; make template cards show actual editable starter examples; explain the guest draft boundary before editing.
- Limit blog sitemap entries and alternate-language links to posts that actually exist in English and Chinese, and redirect unsupported blog locale URLs to a published locale.
- Limit indexable static locale variants by content coverage. Keep all languages for genuinely translated entry pages, English and Chinese for partially translated product pages, and English for legal pages until their bodies receive reviewed translations. Keep other-language paths usable while marking them `noindex,follow` and pointing their canonical to English.
- Redirect the remaining observed legacy 404 paths to relevant public pages.

The local sitemap now contains 65 URLs, down from 170 at the start of the review. This is an intentional reduction of unsupported language variants, not a traffic outcome.

## Follow-up measurement

After Google recrawls the merged site, compare rolling 28-day impressions, clicks, and average position for `/`, `/templates`, `/classroom-quiz-game`, and `/classroom-matching-game`. Check that sitemap and page canonicals agree, alternate-language tags only list published translations, and old 404 samples move into the redirect category. Segment by country and query, rather than treating total indexed URL count as the success metric. A lower URL count is expected because unsupported duplicate locales leave the sitemap.

Next editorial work should add classroom examples for specific subjects and grade bands based on actual teacher search queries and onboarding feedback, then earn links from relevant teacher resources. Submit those pages for indexing only after they contain a distinct, useful lesson example. Google's [people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) is the standard for this content work. Search ranking and traffic gains cannot be guaranteed by the technical changes alone.
