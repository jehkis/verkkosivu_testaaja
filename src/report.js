function line(char = '-', length = 50) {
  return char.repeat(length);
}

export function printReport(result) {
  console.log(line('='));
  console.log(`Testattu sivu: ${result.url}`);
  console.log(line('='));
  console.log(`Otsikko:          ${result.title}`);
  console.log(`HTTP-status:      ${result.status} ${result.ok ? '(OK)' : '(VIRHE)'}`);
  console.log(`Latausaika:       ${result.loadTimeMs} ms`);
  console.log();

  console.log(`Linkit (${result.links.total} kpl, ${result.links.internal} sisäistä)`);
  if (result.links.broken.length === 0) {
    console.log('  Ei rikkinäisiä linkkejä.');
  } else {
    console.log(`  Rikkinäisiä linkkejä: ${result.links.broken.length}`);
    for (const b of result.links.broken) {
      console.log(`    - ${b.url} -> ${b.status ?? 'VIRHE'} ${b.error ?? ''}`);
    }
  }
  console.log();

  console.log(`Kuvat (${result.images.total} kpl)`);
  console.log(`  Ilman alt-tekstiä: ${result.images.missingAlt}`);
  if (result.images.broken.length === 0) {
    console.log('  Ei rikkinäisiä kuvia.');
  } else {
    console.log(`  Rikkinäisiä kuvia: ${result.images.broken.length}`);
    for (const src of result.images.broken) {
      console.log(`    - ${src}`);
    }
  }
  console.log();

  console.log(`Lomakkeet (${result.forms.length} kpl)`);
  for (const form of result.forms) {
    console.log(`  - ${form.method} ${form.action} (${form.inputs} kenttää)`);
  }
  console.log();

  console.log(`Konsolivirheet: ${result.consoleErrors.length}`);
  for (const err of result.consoleErrors) console.log(`  - ${err}`);

  console.log(`Sivuvirheet:    ${result.pageErrors.length}`);
  for (const err of result.pageErrors) console.log(`  - ${err}`);

  console.log(line('='));

  const hasIssues =
    !result.ok ||
    result.links.broken.length > 0 ||
    result.images.broken.length > 0 ||
    result.consoleErrors.length > 0 ||
    result.pageErrors.length > 0;

  console.log(hasIssues ? 'TULOS: Löytyi ongelmia.' : 'TULOS: Kaikki tarkistukset läpäisty.');
  console.log(line('='));

  return hasIssues;
}
