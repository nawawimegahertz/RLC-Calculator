let currentLoad = 1;
let loadCount;
let loadData = [];
let circuitType = "seri";

function setupLoadForm() {
    const loadCountInput = document.getElementById("loadCount").value;
    if (isNaN(loadCountInput) || loadCountInput <= 0) {
        Swal.fire("Error", "Jumlah beban harus berupa angka positif.", "error");
        return;
    }
    loadCount = parseInt(loadCountInput);
    circuitType = document.getElementById("circuitType").value;
    nextStep(1);
}

function submitLoad() {
    const resistance = parseFloat(document.getElementById("resistance").value) || 0;
    const inductance = parseFloat(document.getElementById("inductance").value) || 0;
    const capacitance = parseFloat(document.getElementById("capacitance").value) || 0;

    if (resistance <= 0 && inductance <= 0 && capacitance <= 0) {
        Swal.fire("Error", "Semua nilai beban tidak boleh nol atau negatif!", "error");
        return;
    }

    loadData.push({ resistance, inductance, capacitance });

    currentLoad++;
    if (currentLoad <= loadCount) {
        document.getElementById("load-title").innerText = "Beban ke-" + currentLoad;
        document.getElementById("resistance").value = '';
        document.getElementById("inductance").value = '';
        document.getElementById("capacitance").value = '';
    } else {
        nextStep(2);
    }
}

function calculate() {
    const voltage = parseFloat(document.getElementById("voltage").value) || 0;
    const frequency = parseFloat(document.getElementById("frequency").value) || 0;

    if (voltage <= 0 || frequency <= 0) {
        Swal.fire("Error", "Tegangan dan frekuensi harus lebih dari nol!", "error");
        return;
    }

    const omega = 2 * Math.PI * frequency;
    let totalResistance = 0;
    let totalReactanceInductive = 0;
    let totalReactanceCapacitive = 0;

    if (circuitType === "seri") {
        totalResistance = loadData.reduce((sum, load) => sum + load.resistance, 0);
        totalReactanceInductive = loadData.reduce((sum, load) => sum + omega * load.inductance, 0);
        totalReactanceCapacitive = loadData.reduce((sum, load) => sum + 1 / (omega * load.capacitance || Infinity), 0);
    } else if (circuitType === "paralel") {
        const inverseResistance = loadData.reduce((sum, load) => sum + 1 / (load.resistance || Infinity), 0);
        const inverseInductive = loadData.reduce((sum, load) => sum + 1 / (omega * load.inductance || Infinity), 0);
        const inverseCapacitive = loadData.reduce((sum, load) => sum + omega * load.capacitance, 0);

        totalResistance = 1 / (inverseResistance || Infinity);
        totalReactanceInductive = 1 / (inverseInductive || Infinity);
        totalReactanceCapacitive = 1 / (inverseCapacitive || Infinity);
    }

    const totalReactance = totalReactanceInductive - totalReactanceCapacitive;
    const totalImpedance = Math.sqrt(Math.pow(totalResistance, 2) + Math.pow(totalReactance, 2));
    const totalCurrent = voltage / totalImpedance;

    document.getElementById("total-impedance").innerText = `Impendansi total (Z): ${totalImpedance.toFixed(2)} Ohm`;
    document.getElementById("total-current").innerText = `Arus total: ${totalCurrent.toFixed(2)} Ampere`;
    nextStep(3);
}

function nextStep(step) {
    const steps = document.querySelectorAll('.floating-card');
    steps.forEach((card, index) => {
        if (index === step - 1) {
            card.classList.remove("d-none");
        } else {
            card.classList.add("d-none");
        }
    });

    const progressBar = document.getElementById("progressBar");
    progressBar.style.width = `${step * 25}%`;
    progressBar.setAttribute("aria-valuenow", step * 25);
}

function goBack() {
    if (currentLoad > 1) {
        currentLoad--;
        document.getElementById("load-title").innerText = "Beban ke-" + currentLoad;

        const previousLoad = loadData[currentLoad - 1];
        document.getElementById("resistance").value = previousLoad.resistance;
        document.getElementById("inductance").value = previousLoad.inductance;
        document.getElementById("capacitance").value = previousLoad.capacitance;
    } else {
        nextStep(1);
    }
}
