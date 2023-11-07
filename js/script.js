var grades = [];

var getValidInput = function (content) {
  try {
    let convertedJson = JSON.parse(content);

    if (!convertedJson) return 0;

    let valid = true;
    convertedJson.forEach((grade) => {
      if (
        !grade.hasOwnProperty('semester') ||
        !grade.hasOwnProperty('hours') ||
        !grade.hasOwnProperty('grade') ||
        !grade.hasOwnProperty('locked') ||
        !Number.isInteger(grade.semester) ||
        !Number.isInteger(grade.hours) ||
        Number.isNaN(grade.grade) ||
        typeof grade.locked != 'boolean'
      ) {
        valid = false;
        return 0;
      } else {
        console.log(grade);
      }
    });

    if (valid) {
      return convertedJson;
    }
    return 0;
  } catch (e) {
    return 0;
  }
};

var handleSelectFile = function () {
  console.log('selecting file...');

  let input = document.createElement('input');
  input.type = 'file';

  input.onchange = (e) => {
    let file = e.target.files[0];

    let reader = new FileReader();
    reader.readAsText(file, 'UTF-8');

    reader.onload = (readerEvent) => {
      let content = readerEvent.target.result;
      console.log(content);

      let result = getValidInput(content);

      if (result) {
        grades = result;
        renderTable();
      } else {
        $('#message').html(
          '<div class="alert alert-warning alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Atenção!</strong> Arquivo inserido não é válido.</div>'
        );
      }
    };
  };

  input.click();
};

var handleSaveFile = function () {
  console.log('saving grades on file...');

  let gradesString = JSON.stringify(grades, null, 4);

  let blob = new Blob([gradesString], {
    type: 'application/json;charset=utf-8',
  });
  saveAs(blob, 'Notas - IRA Calculator - ' + new Date() + ' by iciencia.json');
};

var checkbox = function () {
  $("input[type='checkbox']").click(function () {
    console.log('Clique');

    let value = $(this).attr('value');
    let point = $('#nota');

    if (document.getElementById(value).checked) {
      console.log('checking');
      point.attr('disabled', true);

      if (value == 'tranca') {
        document.getElementById('falta').checked = false;
      } else {
        document.getElementById('tranca').checked = false;
      }
    } else {
      console.log('unchecking');
      point.removeAttr('disabled');
    }
  });
};

var addGrade = function (e) {
  e.preventDefault();

  let grade = parseFloat($('#nota').val());
  let semester = parseInt($('#semestre').val());
  let hours = parseInt($('#horas').val());

  let locked = document.getElementById('tranca').checked;
  let miss = document.getElementById('falta').checked;

  if (miss) {
    grade = 0;
  }

  let obj = {
    semester,
    hours,
    grade,
    locked,
  };

  grades.push(obj);

  document.getElementById('formCadeira').reset();
  $('#nota').removeAttr('disabled');

  renderTable();
  console.log(grades);
};

var renderTable = function () {
  let tableContent = $('#table-content');

  if (!grades.length) {
    tableContent.html(
      "<tr><td colspan='4'><center><strong>Não há notas ...</strong></center></td></tr>"
    );
  } else {
    tableContent.html('');

    grades.forEach(function (val, key) {
      tableContent.append(
        `<tr>
              <td>${val.semester}º</td>
              <td>${val.hours}hrs</td>
              <td>${val.locked ? '<strong>TRANCADA</strong>' : val.grade}</td>
              <td> 
                  <button onclick="handleRemoveGrade(${key})" class="btn btn-danger" style="padding:0 .5rem">
                      <i class="fas fa-trash text-white"></i>
                  </button> 
              </td>
          </tr>`
      );
    });
  }
};

var calculateIndividual = function () {
  console.log('testing');

  let t = 0;
  let c = 0;

  let sigA = 0;
  let sigB = 0;

  grades.forEach(function (val) {
    if (val.locked) {
      t += val.hours;
    } else {
      sigA += Math.min(6, val.semester) * val.hours * val.grade;
      sigB += Math.min(6, val.semester) * val.hours;
    }

    c += val.hours;
  });

  let ans = ((1 - (0.5 * t) / c) * sigA) / sigB;
  return ans;
};

var calculateGeneral = function (individual) {
  let avg = parseFloat($('#iraCurso').val()) || 0;
  let dp = parseFloat($('#desvioPadrao').val()) || 0;

  if (avg == 0 || dp == 0) return 0;

  let ans = 6 + 2 * ((individual - avg) / dp);
  return ans;
};

var renderResult = function () {
  if (grades.length > 0) {
    $('#modalResult').modal('show');

    let individual = calculateIndividual();
    let general = calculateGeneral(individual);

    $('#indivualResult').html(individual.toPrecision(3));
    $('#generalResult').html(general.toPrecision(3));
  } else {
    $('#message').html(
      '<div class="alert alert-warning alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Atenção,</strong> Para fazer o cálculo é necessário inserir alguma nota</div>'
    );
  }
};

var removeGrade = function (position) {
  let newGrades = [];

  grades.forEach(function (value, index) {
    if (position != index) {
      newGrades.push(value);
    }
  });

  grades = newGrades;
};

var handleRemoveGrade = function (index) {
  removeGrade(index);

  renderTable();
};

checkbox('opcao');
renderTable();
