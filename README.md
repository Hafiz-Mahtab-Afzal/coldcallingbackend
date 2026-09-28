# coldcallingbackend

REST API for the cold-call tracker. Holds restaurant leads scraped from Google Maps, splits them into
call days, and records what happened on every call.

## Stack

Express 5, Mongoose 8, MongoDB Atlas. ES modules, Node 20 or newer.

## Run it

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment

| Variable | What it is |
| --- | --- |
| `PORT` | Port to listen on. Defaults to `5000`. |
| `MONGO_URI` | MongoDB connection string. Required. |
| `CLIENT_ORIGIN` | Allowed CORS origin, or several separated by commas. |
| `DAILY_TARGET` | Leads per call day. Defaults to `50`. |

Never commit `.env`. It is git ignored, and `.env.example` shows the shape without any real values.

## Data model

A lead carries its Google Maps details plus the call record:

| Field | Meaning |
| --- | --- |
| `hasWebsite` | True when the lead already has a site, which locks it from being worked |
| `dayIndex` | Call day this lead belongs to. `0` for leads that have a website |
| `position` | Sort order inside the city, highest review count first |
| `outcomes` | Every outcome ticked so far, so one never replaces another |
| `lastActionAt` | When the outcomes last changed, used for the monthly report |

`outcomes` accepts `no_answer`, `whatsapp`, `owner_absent`, `call_later`, `tell_tomorrow`,
`already_arranged`, `not_interested`, `agreed`, `done`. An empty array means the lead has not been
called yet.

## Endpoints

| Method | Path | What it does |
| --- | --- | --- |
| GET | `/api/health` | Uptime and Mongoose connection state |
| GET | `/api/leads` | Leads with filters, paging, and a count per outcome |
| GET | `/api/leads/filters` | Countries, cities, and the restaurant types in scope |
| GET | `/api/leads/days` | Call days for a city with progress per day |
| GET | `/api/leads/stats` | Each outcome as a share of contacted leads |
| PATCH | `/api/leads/:id` | Replace a lead's outcomes, note, or call count |
| POST | `/api/leads/import` | Bulk upsert leads for a city |

`GET /api/leads` accepts `country`, `city`, `category`, `outcome`, `day`, `website`, `search`, `page`,
and `limit`. Pass `outcome=none` for leads with nothing ticked yet. Leads that already have a website
return `409` from the PATCH route, since there is nothing to sell them.

## Importing a scraped city

```bash
npm run import -- --file="path/to/leads.csv" --city="Odemira" --country="Portugal"
```

The CSV is read with the Google Maps column names (`title`, `phone`, `website`, `category`, `address`,
`review_count`, `review_rating`, `place_id`). Rows are deduplicated, sorted by review count, and split
into days of `DAILY_TARGET` callable leads. Leads that already have a website get no call day. The
script also backfills missing fields and drops outcome values that are no longer part of the enum, so
re-running it is safe.
