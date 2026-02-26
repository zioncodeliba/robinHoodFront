# MortgageCycleCheck – no-redirect mode (saved)

Use this when you want **submit → show overlay → stay on page** (no redirect after recycle-loan submit).

## How to restore no-redirect

In `MortgageCycleCheck.jsx`, in `handleContinue`, replace the **redirect blocks** (the `if (allowedBankIds.length > 0)` block and the `navigate(hasOffer ? ...)` call) with this commented version:

```js
      // --- REDIRECT: to show overlay only (no redirect), comment out the two blocks below ---
      // if (allowedBankIds.length > 0) {
      //   const responsesPayload = Array.isArray(navSnapshot?.bankResponses)
      //     ? navSnapshot.bankResponses
      //     : [];
      //   const allowedBankSet = new Set(allowedBankIds);
      //   const approvalResponses = responsesPayload.filter((item) => {
      //       const bankIdNumeric = Number(item?.bank_id);
      //       if (!Number.isFinite(bankIdNumeric) || !allowedBankSet.has(bankIdNumeric)) {
      //         return false;
      //       }
      //       const responseCalcResult = item?.extracted_json?.calculator_result;
      //       return isApprovalOfferResult(responseCalcResult);
      //     });
      //   navigate(approvalResponses.length > 0 ? "/viewoffer" : "/homebeforeapproval2", {
      //     replace: true,
      //   });
      //   return;
      // }

      // navigate(hasOffer ? "/mortgagecyclepage" : "/noofferfound", {
      //   state: { bankResponse: payload },
      // });
```

So: **comment out** the `if (allowedBankIds.length > 0) { ... }` block and the `navigate(hasOffer ? "/mortgagecyclepage" : "/noofferfound", ...)` call. Leave the rest of `handleContinue` as-is (overlay still shows via `submitting`, then hides in `finally`).

Delete this file when you no longer need the reference.
