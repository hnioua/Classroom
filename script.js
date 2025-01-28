let data = [];
let students = []; // Ajoutez cette variable pour les étudiants traités

const fileInput = document.getElementById("fileInput");
const tableHeader = document.getElementById("tableHeader");
const tableBody = document.querySelector("#excelTable tbody");
const notesTableBody = document.querySelector("#tableBody");
const statsTableBody = document.querySelector("#statsBody");

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      populateTable(rows);
      processNotes(rows);
    };

    reader.readAsArrayBuffer(file);
  }
});

function populateTable(rows) {
  tableHeader.innerHTML = "";
  tableBody.innerHTML = "";

  if (rows.length > 0) {
    rows[0].forEach((header) => {
      const th = document.createElement("th");
      th.textContent = header;
      tableHeader.appendChild(th);
    });

    rows.slice(1).forEach((row) => {
      const tr = document.createElement("tr");

      row.forEach((cell) => {
        const td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      });

      tableBody.appendChild(tr);
    });
  }
}

function processNotes(rows) {
  students = rows.slice(1).map((row) => ({
    rang: row[0],
    nom: row[1],
    note: parseFloat(row[2]),
    sexe: row[3],
  }));

  // Trier par note décroissante
  students.sort((a, b) => b.note - a.note);

  // Affichage des notes triées
  notesTableBody.innerHTML = "";

  students.forEach((student, index) => {
    const tr = document.createElement("tr");

    // Appliquer la couleur verte à la première ligne et rouge à la dernière ligne
    if (index === 0) {
      tr.style.backgroundColor = "green"; // Couleur verte pour la première ligne
      tr.style.color = "white"; // Rendre le texte visible
    } else if (index === students.length - 1) {
      tr.style.backgroundColor = "red"; // Couleur rouge pour la dernière ligne
      tr.style.color = "white"; // Rendre le texte visible
    }

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${student.nom}</td>
      <td>${isNaN(student.note) ? "NaN" : student.note}</td>
      <td>${student.sexe}</td>
    `;
    notesTableBody.appendChild(tr);
  });

  // Calculer les statistiques
  const notesArray = students
    .map((student) => student.note)
    .filter((note) => !isNaN(note));
  const stats = calculateStats(notesArray);

  statsTableBody.innerHTML = `
    <tr>
      <td>${stats.moyenne.toFixed(2)}</td>
      <td>${stats.mediane.toFixed(2)}</td>
       <td>${stats.min.toFixed(2)}</td>
      <td>${stats.max.toFixed(2)}</td>
      <td>${stats.variance.toFixed(2)}</td>
      <td>${stats.ecartType.toFixed(2)}</td>
    </tr>
  `;

  // Créer des paires dynamiquement
  const pairs = [];
  const n = students.length;

  for (let i = 0; i < Math.floor(n / 2); i++) {
    const pair = {
      nom1: students[i]?.nom + "  " + students[i]?.sexe || "Place libre",
      nom2:
        students[n - 1 - i]?.nom + " " + students[n - 1 - i]?.sexe ||
        "Place libre",
    };
    pairs.push(pair);
  }

  const classroom = document.getElementById("classroom");
  classroom.innerHTML = ""; // Vider la salle de classe avant de la remplir

  // Afficher les paires dans la salle de classe
  pairs.forEach((pair) => {
    const table = document.createElement("div");
    table.classList.add("table");

    const seat1 = document.createElement("div");
    seat1.classList.add("seat");
    seat1.textContent = pair.nom1;

    const seat2 = document.createElement("div");
    seat2.classList.add("seat");
    seat2.textContent = pair.nom2;

    table.appendChild(seat1);
    table.appendChild(seat2);
    classroom.appendChild(table);
  });
}

function calculateStats(notes) {
  const n = notes.length;

  if (n === 0) {
    return {
      moyenne: 0,
      mediane: 0,
      variance: 0,
      ecartType: 0,
      min: 0,
      max: 0,
    };
  }

  const moyenne = notes.reduce((sum, note) => sum + note, 0) / n;
  const sortedNotes = [...notes].sort((a, b) => a - b);
  const mediane =
    n % 2 === 0
      ? (sortedNotes[n / 2 - 1] + sortedNotes[n / 2]) / 2
      : sortedNotes[Math.floor(n / 2)];
  const variance =
    notes.reduce((sum, note) => sum + Math.pow(note - moyenne, 2), 0) / n;
  const ecartType = Math.sqrt(variance);
  const min = sortedNotes[0];
  const max = sortedNotes[n - 1];

  return { moyenne, mediane, min, max, variance, ecartType };
}
