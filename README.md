# vsDraft

## Notes

- LATEST_PATCH = versionsJson[0];
- BASE_CHAMP_URL = `https://ddragon.leagueoflegends.com/cdn/`;

### Action Order:

1. Blue ban #1
2. Red ban #1
3. Blue ban #2
4. Red ban #2
5. Blue ban #3
6. Red ban #3

7. Blue pick #1
8. Red pick #1
9. Red pick #2
10. Blue pick #2
11. Blue pick #3
12. Red pick #3

13. Red ban #4
14. Blue ban #4
15. Red ban #5
16. Blue ban #5

17. Red pick #4
18. Blue pick #4
19. Blue pick #5
20. Red pick #5

## Task List

- [x] Init
- [x] Port palette & fonts from CBL
- [x] Set up datasets (game versions, champions) fetching GitHub Action
- [x] Set up asset fetching GitHub Action (Otherwise, just use a DataDragon URL)
- [ ] ...
- [ ] Initial layout
- [ ] Restyle primary button
- [ ] Functionalities
  - [x] Preprocess champion dataset with id, name, frame file name, position
  - [x] Full champion list
  - [x] Sorted by name
  - [ ] Filter by position
  - [ ] Filter by search
  - [ ] Turn-based
  - [ ] Timers
  - [ ] Pause/Resume
  - [ ] Clear
  - [ ] Undo
  - [ ] Pick override
- [ ] ...
- [ ] Find real app name
- [ ] Metadata
- [ ] Deploy

### Later potentially

- [ ] Set up DB, Redis, Auth, tRPC
- [ ] Allow setting summoner icon (Set gh action for icon set)
- [ ] Edit draft title
- [ ] Save draft, export/import draft
- [ ] Co-op draft
