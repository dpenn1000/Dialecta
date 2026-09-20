# Cyber insurance MFA misrepresentation: Travelers v. ICS

**Source:** U.S. District Court for the Central District of Illinois, Travelers Property Casualty Company of America v. International Control Services, Inc., Case No. 2:22-cv-02145, filed July 6, 2022, read 2026-09-20. https://global.lockton.com/us/en/news-insights/travelers-v-ics-underscores-need-to-respond-carefully-to-cyber-insurance ; https://www.insurancejournal.com/news/national/2022/07/12/675516.htm

## Summary

Travelers Property Casualty Company of America sued its own policyholder, International Control Services (ICS), an Illinois electronics manufacturer, on July 6, 2022, seeking rescission of a cyber liability policy after ICS suffered a ransomware attack in May 2022. Case number and docket dates are confirmed against Justia's docket index; the underlying complaint and stipulated judgment were not read directly, and the account below relies on reporting from Lockton and Insurance Journal. This was not a coverage denial over a technicality: Travelers asked a federal court to declare the policy void from inception, as though it had never existed.

The trigger was the insurance application. ICS's CEO and the person responsible for its network security had signed an application representing that ICS used multi-factor authentication (MFA) for administrative or privileged access across its environment. Travelers' investigation after the ransomware attack found MFA enabled on the firewall only, not on the servers the attackers actually used to move through the network. Travelers' legal theory was material misrepresentation: had it known the true state of ICS's MFA deployment, it would not have issued the policy on the terms it did. Under that doctrine the remedy is not a reduced payout, it is rescission: the insurer is entitled to treat the contract as never having existed.

The case did not reach a merits ruling. On August 26, 2022, Travelers and ICS stipulated to entry of judgment rescinding the policy; ICS did not contest it through trial. A stipulated judgment is not binding precedent that every MFA misstatement voids a policy, but brokers and law firms across the industry treat this case as the reference point for the risk, and cite it specifically for the gap between an MFA answer given as an enterprise-wide fact and MFA enabled on one control point only.

## Implies for Dialecta

- When Dialecta applies for cyber or technology errors-and-omissions coverage, any MFA question on the application should be answered against what is actually enforced today across every admin path (the Supabase dashboard, the Vercel project, GitHub, the deployed API's own admin functions), not against a policy goal or an intention.
- This agent's own reading list already flags two gaps in that direction: a token written to an unignored path on 2026-09-19, and no completed inventory yet of who can reach the deployed API's admin surface. Either is the kind of gap Travelers' post-incident forensics found on ICS's servers rather than its firewall.
- An application answer is not a one-time form. If MFA coverage changes later, such as a new admin path added without it or a service account that bypasses it, the representation on file becomes wrong at that moment, not just at renewal.
- Not legal advice, and not insurance advice. What would settle it: an insurance broker's or coverage attorney's read of the actual application language on any policy Dialecta applies for, since the exact warranty wording, a one-time attestation against a continuing warranty, controls the outcome more than this single case does.

*Filed 2026-09-20*
