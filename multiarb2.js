function calculateArb() {
  const totalStake = parseFloat(document.getElementById("totalStake").value);
  if (isNaN(totalStake) || totalStake <= 0) {
    alert("Please enter a valid total stake!");
    return;
  }

  const gamesContainer = document.getElementById("gamesContainer");
  const gameDivs = gamesContainer.getElementsByClassName("game");
  const outcomes = ["Over", "Under"];
  const combinations = [];
  const combinedOdds = [];
  const stakes = [];
  const payouts = [];
  const odds = {};

  // Collect data from dynamically added games
  Array.from(gameDivs).forEach((gameDiv, index) => {
    const clubName = document.getElementById(`club${index + 1}Name`).value || `Club ${index + 1}`;
    const overOdd = parseFloat(document.getElementById(`club${index + 1}Over`).value);
    const underOdd = parseFloat(document.getElementById(`club${index + 1}Under`).value);

    if (isNaN(overOdd) || isNaN(underOdd)) {
      alert(`Please enter valid odds for ${clubName}!`);
      return;
    }

    odds[`club${index + 1}`] = { name: clubName, Over: overOdd, Under: underOdd };
  });

  // Generate combinations dynamically
  function generateCombinations(outcomes, clubs) {
    if (clubs.length === 0) return [[]];
    const [club, ...rest] = clubs;
    const subCombinations = generateCombinations(outcomes, rest);
    return outcomes.flatMap(outcome =>
      subCombinations.map(combination => [outcome, ...combination])
    );
  }

  const clubs = Object.keys(odds);
  const outcomeCombinations = generateCombinations(outcomes, clubs);

  // Calculate combined odds and stakes
  for (const combination of outcomeCombinations) {
    const combinationNames = combination.map((outcome, i) => `${odds[clubs[i]].name} (${outcome})`);
    combinations.push(combinationNames.join(", "));
    const odd = combination.reduce((acc, outcome, i) => acc * odds[clubs[i]][outcome], 1);
    combinedOdds.push(odd);
  }

  const inverseOdds = combinedOdds.map(odd => 1 / odd);
  const totalInverse = inverseOdds.reduce((sum, val) => sum + val, 0);
  for (const inv of inverseOdds) {
    stakes.push((totalStake * inv) / totalInverse);
  }

  // Calculate payouts
  for (let i = 0; i < combinedOdds.length; i++) {
    payouts.push(stakes[i] * combinedOdds[i]);
  }

  // Display results
  const resultsTable = document.querySelector("#resultsTable tbody");
  resultsTable.innerHTML = ""; // Clear previous results
  for (let i = 0; i < combinations.length; i++) {
    const row = `<tr>
      <td>${combinations[i]}</td>
      <td>${stakes[i].toFixed(2)}</td>
      <td>${combinedOdds[i].toFixed(2)}</td>
      <td>${payouts[i].toFixed(2)}</td>
    </tr>`;
    resultsTable.innerHTML += row;
  }

  const averagePayout = payouts.reduce((sum, val) => sum + val, 0) / payouts.length;
  const returnPercentage = (averagePayout / totalStake) * 100;
  const lossPercentage = 100 - returnPercentage;

  document.getElementById("summary").textContent = `
    Average Payout: ₦${averagePayout.toFixed(2)} 
    | Return Percentage: ${returnPercentage.toFixed(2)}% 
    | Loss Percentage: ${lossPercentage.toFixed(2)}%
  `;
}
