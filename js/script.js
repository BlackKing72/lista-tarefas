/* -------------------------------------------------------------------------- */
/* Storage functions -------------------------------------------------------- */

const TASK_STORAGE_KEY = 'tasks';

// Carrega as tarefas do 'banco de dados'.
const loadTasksFromStorage = () => {
    return JSON.parse(localStorage.getItem(TASK_STORAGE_KEY)) || [];
};

// Salvas as tarefas atualizadas no 'banco de dados'.
const saveTasksToStorage = (tasks) => {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
};

// Adiciona uma tarefa no 'banco de dados'
const insertTaskOnStorage = (task) => {
    const tasks = loadTasksFromStorage();
    tasks.push(task);
    saveTasksToStorage(tasks);
};

// Atualiza uma tarefa no 'banco de dados'
const updateTaskOnStorage = (index, task) => {
    const tasks = loadTasksFromStorage();
    tasks[index] = task;
    saveTasksToStorage(tasks);
};

// Remove uma tarefa do 'banco de dados'
const removeTaskFromStorage = (index) => {
    const tasks = loadTasksFromStorage();
    tasks.splice(index, 1);
    saveTasksToStorage(tasks);
};

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

// Verifica se os campos estão validos. Se algum campo estiver vazio, marcar o
// campo como invalido e retorna FALSE, senão retorna TRUE.
const validateInputs = (inputs) => {
    let isInputValid = true;

    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value === '') {
            inputs[i].classList.add('invalid-input');
            isInputValid = false;
        }
    }

    return isInputValid;
};

// Desmarca os campos que foram invalidados se necessário.
const resetInvalidInputs = (inputs) => {
    inputs.forEach(input => {
        if (input.classList.contains('invalid-input'))
            input.classList.remove('invalid-input'); 
    });
};

/* -------------------------------------------------------------------------- */
/* Tasks functions ---------------------------------------------------------- */

const taskForm = document.querySelector('.tasks-form');
const taskDate = document.querySelector('#idTaskDate');
const taskName = document.querySelector('#idTaskName');
const taskStatus = document.querySelector('#idTaskStatus');

const taskSubmit = document.querySelector('#idTaskSubmit');
const taskCancel = document.querySelector('#idTaskCancel');

const resetForm = () => taskForm.reset();

const displayTasks = () => {
    const tasks = JSON.parse(localStorage.getItem(TASK_STORAGE_KEY)) || [];

    const table = document.querySelector('#idTasksTable');
    const tbody = table.querySelector('tbody');

    tbody.innerHTML = `
        <tr>
            <th>Data</th>
            <th>Nome</th>
            <th>Status</th>
            <th>Editar</th>
            <th>Excluir</th>
        </tr>
    `;

    tasks.forEach((task, index) => {
        const date = new Date(task.date);
        const formattedDate = date.toLocaleDateString();

        console.log(task.date);

        const row = tbody.insertRow();
        row.innerHTML = `
            <tr>
                <td>${formattedDate}</td>
                <td>${task.task}</td>
                <td>${task.status}</td>
                <td><button class="btn-edit tasks-button" onclick="enterEditMode(${index})">
                    <i class="fa-solid fa-pen-to-square fa-lg"></i>
                    <p>Editar</p>
                </button></td>
                <td><button class="btn-delete tasks-button" onclick="removeTask(${index})">
                    <i class="fa-solid fa-trash-can fa-lg"></i>
                    <p>Excluir</p>
                </button></td>
            </tr>
        `;
    });
};

const insertTask = (event) => {
    event.preventDefault();

    if (!validateInputs([taskDate, taskName, taskStatus])) {
        return;
    }
   
    insertTaskOnStorage({
        date: taskDate.valueAsDate,
        task: taskName.value.trim(),
        status: taskStatus.value.trim()
    });

    displayTasks();
    resetForm();
};

const removeTask = (index) => {
    // Tenta salvar a tarefa editada, senão conseguir, ignora a edição, 
    // encerra o modo de edição e limpa o formulário.
    if (editingTaskIndex >= 0 && !tryEditTask()) {
        exitEditMode();
        resetForm();
    }

    removeTaskFromStorage(index);
    displayTasks();
    resetForm();
};

// Indica se alguma tarefa está sendo editada. 
// == -1 = não está editando uma tarefa.
// >=  0 = o index da tarefa sendo editada.
let editingTaskIndex = -1;

// Prepara o formulário para o modo de edição de tarefas.
const enterEditMode = (index) => {
    editingTaskIndex = index;

    taskSubmit.value = "Atualizar";
    taskSubmit.removeEventListener('click', insertTask);
    taskSubmit.addEventListener('click', updateTask);

    taskCancel.value = "Cancelar";
    taskCancel.removeEventListener('click', resetForm);
    taskCancel.addEventListener('click', exitEditMode);

    const task = loadTasksFromStorage()[index];
    taskDate.valueAsDate = new Date(task.date);
    taskName.value = task.task;
    taskStatus.value = task.status;

    resetInvalidInputs([taskDate, taskName, taskStatus]);
};

// Volta o formulário para o modo de adicionar tarefas.
const exitEditMode = () => {
    editingTaskIndex = -1;

    taskSubmit.value = "Adicionar";
    taskSubmit.removeEventListener('click', updateTask);
    taskSubmit.addEventListener('click', insertTask);

    taskCancel.value = "Limpar";
    taskCancel.removeEventListener('click', exitEditMode);
    taskCancel.addEventListener('click', resetForm);

    resetInvalidInputs([taskDate, taskName, taskStatus]);
    resetForm();
};

const updateTask = (event) => {
    event.preventDefault();
    tryEditTask();
};

// Tenta editar uma tarefa. Retorna TRUE se conseguir ou FALSE se ocorrer um erro.
// - a função 'enterEditMode' precisa ter sido chamada antes.
// - todos os campos do formulários precisam ser validos.
const tryEditTask = () => {
    if (editingTaskIndex < 0 || !validateInputs([taskDate, taskName, taskStatus])) {
        return false;
    }

    const task = {
        date: document.querySelector('#idTaskDate').valueAsDate,
        task: document.querySelector('#idTaskName').value.trim(),
        status: document.querySelector('#idTaskStatus').value.trim()
    };

    updateTaskOnStorage(editingTaskIndex, task);
    displayTasks();
    exitEditMode();

    return true;
};

// const editTask = (index) => {
//     document.querySelector('#idTaskSubmit').value = "Atualizar";

//     const tasks = JSON.parse(localStorage.getItem(TASK_STORAGE_KEY)) || [];
//     const task = tasks[index];

//     console.log(`editing task ${task}`);

//     document.querySelector('#idTaskDate').value = task.date;
//     document.querySelector('#idTaskName').value = task.task;
//     document.querySelector('#idTaskStatus').value = task.status;

//     const updateTask = () => {
//         task.date = document.querySelector('#idTaskDate').value.trim();
//         task.task = document.querySelector('#idTaskName').value.trim();
//         task.status = document.querySelector('#idTaskStatus').value.trim();

//         localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));

//         document.querySelector('#idTaskSubmit').value = "Adicionar";
//         document.querySelector('.tasks-form').reset();

//         document.querySelector('#idTaskSubmit').removeEventListener('click', updateTask);
//         document.querySelector('#idTaskSubmit').addEventListener('click', insertTask);

//         displayTasks();
//     };

//     document.querySelector('#idTaskSubmit').removeEventListener('click', insertTask);
//     document.querySelector('#idTaskSubmit').addEventListener('click', updateTask);

// }





const initialize = () => {
    taskSubmit.addEventListener('click', insertTask);
    taskCancel.addEventListener('click', resetForm);

    taskDate.addEventListener('input', () => { resetInvalidInputs([ taskDate ]); });
    taskName.addEventListener('input', () => { resetInvalidInputs([ taskName ]); });
    taskStatus.addEventListener('input', () => { resetInvalidInputs([ taskStatus ]); });

    displayTasks();
};

initialize();

// localStorage.removeItem(TASK_STORAGE_KEY);

// const tasks = [
//     { date: new Date("2024-06-05"), task: "Estudar Javascript", status: "Pendente" },
//     { date: new Date("2024-06-05"), task: "Estudar Banco de Dados", status: "Realizando" },
//     { date: new Date("2024-06-06"), task: "Almoçar", status: "Completado" },
//     { date: new Date("2024-06-07"), task: "Dormir", status: "Pendente" },
// ];
// 2024-06-05T00:00:00.000Z
// localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));