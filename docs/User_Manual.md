# User Manual

## Plan a journey

1. Open **Find routes**.
2. Type the origin stop and choose a suggested name when available.
3. Enter the destination, then select **Search routes** or press Enter. Use the swap control to reverse the two stops.
4. The app shows direct services first. If there is no direct service, it looks for one transfer, then at most two. Review the number of transfers and total stops travelled.
5. For each bus leg, expand **View stops** to inspect its ordered stop sequence. Transfer instructions identify the stop where you change buses.

Search ignores letter case, punctuation and extra spaces. Suggestions can correct small spelling errors. Approved aliases are accepted; pending alias suggestions are not merged. If a pair has no route, check the suggested spelling or use the report form.

## Browse service and stop information

- Use **Bus services** to search by service name, type or stop, then browse the directory.
- Use **Find services at a stop** to list approved services that pass through that canonical stop.
- Service details include bilingual service names when supplied, type, operating-hours text and ordered stops. “Not available” means the source did not provide a value.
- The language toggle translates the primary commuter interface. Stop names remain in English because the source dataset does not include Bangla stop translations.

## Report an issue

Choose a report type, optionally pick a service or stop, and describe the issue in 10-1000 characters. Contact details are optional. A successful submission returns a reference and Pending status. Reports are for review and do not immediately change public route data. The API limits a client to five reports per hour.

## Administrator workflow

The administrator section is used by the team. Configure `ADMIN_USER` and `ADMIN_PASSWORD` on the server, sign in, then review service records, pending alias suggestions and community reports. Service changes can be saved as Draft, Approved or Hidden. Review stop-merge suggestions before approving them. Report status can be changed with a note. Re-importing restores the supplied source data and can overwrite manual service edits, so review its summary before applying it.

## How to interpret results

- A stop count is the number of route transitions travelled on each leg; a shared transfer stop is counted as the end of one leg and start of the next.
- Listed order is the source order. Reverse directions are inferred because source records do not encode direction; confirm with the bus operator.
- A shared stop is assumed to be a usable interchange. Verify the physical stop and current bus operation locally.
- This is route guidance, not live service information. It has no fares, arrival estimates, coordinates, ticketing or map navigation.
