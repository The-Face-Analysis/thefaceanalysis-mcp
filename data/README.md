# thefaceanalysis-data

Face measurement statistics from 102 adult faces, measured with a 478-point landmarker:
percentiles for fWHR, midface ratio, symmetry, golden ratio fit, pupillary distance and
canthal tilt (all / women / men), the face, eye, lip and nose types with their rules,
every classification threshold, how the score correlated with 2,513 human raters, and the
dated method change history.

```js
import { referenceSet, median } from "thefaceanalysis-data";
median("fwhr");            // 1.78
median("midface", "male"); // 1.06
referenceSet.citeAs;
```

Also importable as plain files: `thefaceanalysis-data/reference-set.json`, `/types.json`,
`/changelog.json`, `/face-measurements.csv`.

**Limits.** One research set, photographed in one city in one month. The numbers describe these
faces, not a population: no count is a prevalence and no median is a norm. Face type splits show how
the detector divides these faces, not how common a type is.

Licenses: data CC BY 4.0 (see `DATA-LICENSE.md`), code MIT.
Live pages: https://thefaceanalysis.com/face-measurement-statistics · https://thefaceanalysis.com/methodology
