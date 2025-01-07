## Setup

Install dependencies:

```
$ yarn install
```

## Development

Start the development server:

```
$ PORT=8081 REACT_APP_DHIS2_BASE_URL="http://localhost:8080" yarn start
```

Now in your browser, go to `http://localhost:8081`.

Notes:

-   Requests to DHIS2 will be transparently proxied (see `src/setupProxy.js`) from `http://localhost:8081/dhis2/path` to `http://localhost:8080/path` to avoid CORS and cross-domain problems.

-   The optional environment variable `REACT_APP_DHIS2_AUTH=USERNAME:PASSWORD` forces some credentials to be used by the proxy. This variable is usually not set, so the app has the same user logged in at `REACT_APP_DHIS2_BASE_URL`.

-   The optional environment variable `REACT_APP_PROXY_LOG_LEVEL` can be helpful to debug the proxyfied requests (accepts: "warn" | "debug" | "info" | "error" | "silent")

-   Create a file `.env.local` (copy it from `.env`) to customize environment variables so you can simply run `yarn start`.

-   [why-did-you-render](https://github.com/welldone-software/why-did-you-render) is installed, but it does not work when using standard react scripts (`yarn start`). Instead, use `yarn start-profiling` to debug re-renders with WDYR. Note that hot reloading does not work out-of-the-box with [craco](https://github.com/gsoft-inc/craco).

## Tests

### Unit tests

```
$ yarn test
```

### Integration tests (Cypress)

Create the required users for testing (`cypress/support/App.ts`) in your instance and run:

```
$ export CYPRESS_EXTERNAL_API="http://localhost:8080"
$ export CYPRESS_ROOT_URL=http://localhost:8081

# non-interactive
$ yarn cy:e2e:run

# interactive UI
$ yarn cy:e2e:open
```

## Build app ZIP

```
$ yarn build
```

## Some development tips

### Structure

-   `i18n/`: Contains literal translations (gettext format)
-   `public/`: Main app folder with a `index.html`, exposes the APP, contains the feedback-tool.
-   `src/pages`: Main React components.
-   `src/domain`: Domain layer of the app (clean architecture)
-   `src/data`: Data of the app (clean architecture)
-   `src/components`: Reusable React components.
-   `src/types`: `.d.ts` file types for modules without TS definitions.
-   `src/utils`: Misc utilities.
-   `src/locales`: Auto-generated, do not update or add to the version control.
-   `cypress/integration/`: Cypress integration tests.

### i18n

```
$ yarn localize
```

### App context

The file `src/contexts/app-context.ts` holds some general context so typical infrastructure objects (`api`, `d2`, ...) are readily available. Add your own global objects if necessary.

### Scripts

Check the example script, entry `"script-example"`in `package.json`->scripts and `src/scripts/example.ts`.

### About Plugins

There are two ways to include visualizations:

-   Using iframes: Supported by newer features of the app platform
-   Using JavaScript plugins (Legacy): Maintained for backward compatibility

The reference implementation for iframes can be found in the `VisualizationContents` component. In the future, the [App Runtime Plugin component](https://developers.dhis2.org/docs/app-runtime/components/plugin/) may replace this component.

Legacy visualizations are implemented in the `LegacyVisualizationContents` component. This approach is retained for backwards compatibility and to support visualizations not yet compatible with the iframe plugin architecture.

#### Legacy Plugins

Right now the application support 5 different legacy plugins:

| Report        | plugin filename |
| ------------- | --------------- |
| Pivot Tables  | reporttable.js  |
| Event Charts  | eventchart.js   |
| Event Reports | eventreport.js  |
| Maps          | map.js          |
| Charts        | chart.js        |

You can see within the **public** folder the following folder structure:

```
/236
  reporttable.min.js
  eventchart.min.js
  # all the other plugins

/237
  reporttable.min.js
  eventchart.min.js
  # all the other plugins

/238
  reporttable.min.js
  eventchart.min.js
  # all the other plugins
```

Plugins have different functionality depending on the DHIS2 version, so we first get the version and load the scripts from the corresponding folder.

#### Adding a new Legacy Plugin version

If you want to add a new version the first thing to do is download the .war file from the [releases page](https://releases.dhis2.org/). Pick the version you want.

Now you need to unzip the war file into a folder in your computer

```bash
$ unzip ./dhis2-stable-2.39.0.war -d ./war-239
```

Now go into the new folder and find the plugins:

```bash
$ cd war-239
$ find | grep '\(eventreport\|reporttable\|chart\|map\)\.js$'
```

Which returns the path to plugin scripts (not all the versions have the plugins in the same paths):

```
./dhis-web-event-visualizer/eventchart.js
./dhis-web-event-reports/eventreport.js
./dhis-web-maps/map.js
./dhis-web-interpretation/chart.js
./dhis-web-interpretation/reporttable.js
```

Inside **public**, create a new folder with the version (example: `239`) you want to add:

```
/public
  /239
```

Now copy all files inside the folder. As a final step, please add the word ".min" to the every file so prettier does not try to do its magic on them.

```
/public
  /239
    reporttable.min.js
    eventchart.min.js
    eventreport.min.js
    map.min.js
    chart.min.js
```

Now you can start the server and check if every visualization is working properly.

### Storage

Settings can be saved in the data store (default) or as constants. Use the env variable **REACT_APP_STORAGE** to select which one to use (`datastore` or `constants`).

### Custom Header and Footer

The header and footer can be configured in `src/app-config.ts`. They can be disabled by setting their values to `false`.
See `HeaderOptions` and `FooterOptions` types for supported options.

Example config:

```typescript
{
 header: {
     title: "Dashboard Reports - Custom Header Title",
     background: "rgba(19,52,59,1)",
     color: "white",
 },
 footer: {
     text: `Dashboard Reports - Custom Footer.
     Multi-line text is allowed.
     TBD: More customization options.
     `,
     background: "linear-gradient(90deg, rgba(31,41,30,1) 0%, rgba(20,50,28,1) 50%, rgba(31,41,30,1) 100%)",
     color: "white",
 }
}
```
