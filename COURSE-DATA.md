# hope. 코스 데이터

`dist/data/flamingo.json` is the canonical personal course pack, versioned with this existing Site's source repository. No separate paid database is required. Do not erase it when a round ends. Only a real round's tee/current positions are device-local; simulation positions are ephemeral and never saved as real rounds.

Fields per point: WGS84 lat/lon, source sharing URL, original URLX/URLY where retrievable, provided coordinates, recomputed coordinates, transformation method and date, conversion result, geometry/field status. Conversion checked does NOT mean that the selected location is the correct hole's green or licensed for third-party redistribution. This is the user's private personal test data, not a public dataset service.

Sources: user handover 2026-11-09; Kakao share redirects; conversion WCONGNAMUL / 2.5 -> EPSG:5181 -> EPSG:4326 using PROJ/pyproj. Geometry and actual tee markers need field confirmation. Do not infer left/right for Links4, use A/B. Park1 tee's White classification is unconfirmed. Never use the withdrawn Park9 URL 0ZLAfmwNaB.

Add future clubs as `dist/data/<stable-id>.json` using the same schema. Keep rights/source/check dates. Null points must stay unsupported; never manufacture greens from a club centroid or scorecard yardage. Maintain authoritative data with source control; optional device cache is a convenience, not the sole copy.
