# Weekly Project Status

## Summary

The ingestion pipeline is stable after the retry fix shipped on Tuesday. Median processing time dropped from 4.8s to 3.1s in production.

## Risks

- Vendor rate limits still affect backfills larger than 50k rows.
- The alert threshold for failed imports is too noisy during deploy windows.

## Next Steps

- Add a dedicated backfill queue with capped concurrency.
- Tighten the failed-import alert to ignore the first five minutes after deploy.
