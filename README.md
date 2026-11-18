# Campus Stores

> **Reviewers: start here.** My response to the candidate brief is in [Submission](#submission-the-register-should-know-where-the-adapter-is) below. The prototype is live in `app.js` and `styles.css`. Open `index.html` and click **Restart sample shift** to play the same job with the change.

## Submission: the register should know where the adapter is

### What the product handles well

**Issuing against an approved request.** At 3:45 pm I tried putting the camera (CA-03) on the Film Society's slip. The app refused because cameras aren't on RQ-214. It also refused a second adapter because the approved quantity was already out, and it never offered PR-06 because that projector is in the workshop. The approval form is enforced at the moment a unit leaves the desk, which is when a mistake is cheapest to catch. I kept all of this unchanged.

### What I would change

**The partial return, and the handover it creates.** At 7:30 pm Kabir brought back two of three units:

- The register rows read `L-403 · SP-02` with a one-click **Record return**. Nothing showed the item type, nothing checked the unit in my hand matched the slip, and there was no undo. One mis-click would close the adapter's slip while Leela still had it, and inventory would then show it on the shelf.
- I had no way to record what Kabir told me. The adapter's slip still said **Kabir Sen · due Fri 8 pm**. The facts that mattered (Leela has it, back at 9 am) could only go into a free-text desk book note.
- At 9 am the new shift has to match that prose against the register. Two identical-looking adapters (AD-12 and AD-15) share bin C4, and the slip is overdue against a time that no longer applies. Nothing confirms that the adapter Leela puts on the counter is the one on the slip.

The handover lived in someone's note instead of in the record. So the **decision**: who holds a unit and when it's due back belong on the slip itself, and a slip closes only when the unit's tag matches.

### The change (prototype)

1. **Register grouped by request.** RQ-214 shows as one kit ("1 of 3 out"). Each slip shows unit, type, model, home bin and who collected it. Approved items not yet issued appear as "Not issued" rows.
2. **Check in by asset tag.** Closing a slip asks for the tag on the unit and who handed it back. A mismatch is explained instead of accepted, e.g. *"AD-15 (Anker A8312) is recorded as on the shelf, not on loan. L-404 is for AD-12 (Belkin AVC002)."* Each return is stamped with the time and the person.
3. **"Still out…" records custody.** You record who has the unit now, when it's expected back and what the borrower said. The slip shows `With Leela Das · expected Sat 9 am (was due Fri 8 pm)`, and the update is posted to the desk book automatically.
4. **Return outcome.** Check-in also records the unit's condition. **Damaged** closes the slip but sends the unit to repair, so it can't be issued again until fixed. **Accessory missing** closes the slip and records what's missing. Either one requires a description and posts a follow-up to the desk book.
5. **Overdue / Due now flags** are computed from desk time against each slip's current expected time.
6. **"Still out right now"** sits at the top of the desk book and is read from the register, so the morning shift sees outstanding units before any prose.
7. **Issuing a kit** (small, same idea): "Issue from this request" opens a slip form with the request and its return time filled in. After each slip the form stays open with the same borrower and lists what is still to issue. Kabir can't leave without the adapter and nobody notice.

### Walkthrough of the same job with the change

| Desk time | Before | After |
|---|---|---|
| Fri 3:45 pm | Three blank slip forms; nothing says the adapter is still missing | Open RQ-214 → **Issue from this request**. After the projector and speaker, the form says *Still to issue for RQ-214: USB-C → HDMI adapter* |
| Fri 7:30 pm | Click **Record return** twice and hope the rows are right; type a note about Leela | **Check in** the projector (type `PR-04`) and speaker (`SP-02`). Typing `SP-05` by mistake is caught. On the adapter, **Still out…** → Leela Das, Sat 9 am, "dropping off at nine" |
| Sat 9:00 am | Read the desk book, find the adapter slip under Kabir's name, overdue, and work out which adapter it is | Desk book opens with *L-404 · AD-12 · with Leela Das · expected Sat 9 am · Due now*. **Check in** pre-selects Leela as the person handing it back. Type the tag: `AD-12` closes the slip, `AD-15` is refused with an explanation |

### What I kept

- One slip per physical unit.
- The approval and quantity checks, and the repair exclusion.
- The desk book for human messages.
- The three-moment shift.
- The no-build, offline, single-file setup.

The change reshapes the register rather than adding a new screen.

### What I left out, on purpose

- Barcode scanning: typing the tag is a stand-in for scanning it.
- Undoing a return: the tag check removes most of the need.
- An AI layer that reads handover notes: a model could turn "Kabir returned the projector" into a suggested event. But the failure I saw was a claim being treated as a fact. A model's reading of a note is also a claim, so it could only ever propose a match, and a slip would still close only on a physical tag check. I fixed the record first. Note extraction is the next step, kept strictly advisory.
- Editing a slip's borrower after issue: custody is recorded alongside the original "collected by", not instead of it, so the history stays honest.

### One observation at a real counter

At the Saturday-morning handover, **watch whether the incoming staff member closes Leela's slip from the register alone, or still opens the desk book or asks a colleague first.** If they go straight from "Still out right now" to **Check in** and type the right tag, the custody record is doing the handover. If they still read the notes before acting, the slip isn't carrying enough and the change hasn't helped.

---

Campus Stores is a Product Engineer work sample set at a fictional campus media equipment desk. Work through a club’s screening, from equipment pickup to a partial return and the next morning’s handover. Open **Candidate brief** in the app for the assignment.

## Run the app

Open `index.html` in a modern browser. The app includes its scripts, styles, and icons and can run offline.

To serve it over local HTTP, run this from the repository folder and visit `http://localhost:8000`.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Each browser stores its own sample shift locally when browser storage is available. **Restart sample shift** restores the fictional starting records.

## Source

- `index.html` contains the desk layout, candidate brief, and bundled icons.
- `app.js` contains the sample records and interactions.
- `styles.css` defines the desktop and mobile layouts.

Icon license notices are in [third-party/lucide-LICENSE.txt](third-party/lucide-LICENSE.txt).


## Submit your work

1. [Fork Campus Stores](https://github.com/virinchi-healthcare/campus-stores/fork) into your GitHub account. Complete the candidate brief and push your changes to your public fork. In your README, point reviewers to your work and explain the decision you made.
2. In your fork, open **Commits**, select the final commit you want reviewed, and copy the page URL. It should look like `https://github.com/YOUR-USERNAME/campus-stores/commit/COMMIT-SHA`.
3. [Submit your work through the Google Form](https://docs.google.com/forms/d/e/1FAIpQLScvzoh1R4WS-SkiwAVBQbMvniieJYSoOEfLMyVo5CyjOvYUgQ/viewform). Your **roll number**, **email ID**, and **final commit link from your public fork** are required. Enter your roll number and email ID in the form only.
