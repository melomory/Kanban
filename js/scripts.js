restoreSession();

/************************ Обработка объектов по-умолчанию *************************/
let taskLists = document.querySelectorAll(".task-list");

for (const taskList of taskLists) {
  addTaskHandler(taskList.querySelector(".task-add"));
}

let deleteTasks = document.querySelectorAll(".task-delete");

for (const deleteTask of deleteTasks) {
  if (deleteTask.classList.contains("task-list-delete")) {
    addDeleteListHandler(deleteTask);
  } else {
    addDeleteTaskHandler(deleteTask);
  }
}

let taskItems = document.querySelectorAll(".task-item");
for (const taskItem of taskItems) {
  if (!taskItem.classList.contains("task-default")) {
    taskItem.draggable = true;
  }
}

for (const taskList of taskLists) {
  addEventListenerDragStart(taskList);
  addEventListenerDragEnd(taskList);
  addEventListenerDragOver(taskList);
}

let taskBodies = document.querySelectorAll(".task-body");
for (const taskBody of taskBodies) {
  if (taskBody.querySelector(".task-input") !== null) {
    addEventListenerOnDoubleClick(taskBody);
  }
}

let taskInputs = document.querySelectorAll(".task-input");
for (const taskInput of taskInputs) {
  addEventListenerOnBlur(taskInput);
}

/*********************************************************************************/

/************************ Изменение названия задачи ******************************/
/**
 * Добавление монитора событий двойного нажатия мышью на задаче
 * @param {object} taskBody Видимая область задачи
 */
function addEventListenerOnDoubleClick(taskBody) {
  taskBody.parentElement.ondblclick = function () {
    taskBody.querySelector(".task-view").classList.add("hide");
    taskBody.querySelector(".task-input").classList.add("show");
    taskBody.querySelector(".task-input").focus();
    taskBody.parentElement.draggable = false;
  };
}
/**
 * Добавление монитора событий смены фокуса с поля ввода
 * @param {object} taskInput Поле ввода
 */
function addEventListenerOnBlur(taskInput) {
  taskInput.onblur = function () {
    taskInput.classList.remove("show");
    let taskInputValue = taskInput.value;
    taskInput.parentElement.querySelector(
      ".task-view"
    ).innerHTML = taskInputValue;
    taskInput.parentElement
      .querySelector(".task-view")
      .classList.remove("hide");
    taskInput.parentElement.parentElement.draggable = true;
  };
}

/*********************************************************************************/

/************************ Добавление нового списка задач *************************/
let addTaskList = document.querySelector(".task-list-add");
let taskTypes = document.querySelector(".task-board").children;

addTaskList.onclick = function () {
  let newTaskListName = document.querySelector(".task-list-input").value;
  if (!newTaskListName) newTaskListName = "Задачи";
  let newTaskList =  createTaskList(newTaskListName);

  if (taskTypes.length) {
    taskTypes[taskTypes.length - 1].after(newTaskList);
  } else {
    document.querySelector(".task-board").appendChild(newTaskList);
  }
};

/**
 * Создает новый список задач
 * @param {string} listName Название списка задач
 * @returns {object} новый список
 */
function createTaskList(listName) {
  let taskType = document.querySelector("#task-list-template").content.cloneNode(true);
  let taskList = taskType.querySelector(".task-list")
  addTaskHandler(taskType.querySelector(".task-add"));
  addDeleteListHandler(taskType.querySelector(".task-list-delete"));
  addEventListenerDragStart(taskList);
  addEventListenerDragEnd(taskList);
  addEventListenerDragOver(taskList);
  return taskType;
}

/**
 * Добавляет обработчик для удаления списка задач
 * @param {object} deleteTask Объект кнопки удаления
 */
function addDeleteListHandler(deleteList) {
  deleteList.onclick = function () {
    if (confirm("Удалить список?")) {
      deleteList.parentElement.parentElement.remove();
    }
  };
}
/*********************************************************************************/

/******************************Drag and drop**************************************/
/**
 * Добавление монитора событий начала переноса
 * @param {object} taskList Список задач
 */
function addEventListenerDragStart(taskList) {
  taskList.addEventListener(`dragstart`, (evt) => {
    evt.target.classList.add(`selected`);
  });
}

/**
 * Добавление монитора событий окончания переноса
 * @param {object} taskList Список задач
 */
function addEventListenerDragEnd(taskList) {
  taskList.addEventListener(`dragend`, (evt) => {
    evt.target.classList.remove(`selected`);
  });
}

/**
 * Добавление монитора событий переноса
 * @param {object} taskList Список задач
 */
function addEventListenerDragOver(taskList) {
  taskList.addEventListener(`dragover`, (evt) => {
    evt.preventDefault();

    const activeElement = document.querySelector(`.selected`);
    const activeTaskList = activeElement.parentElement;
    const currentElement = evt.target;
    const isMoveable =
      activeElement !== currentElement &&
      currentElement.classList.contains(`task-item`);

    if (!isMoveable) {
      return;
    }

    // evt.clientY — вертикальная координата курсора в момент,
    // когда сработало событие
    const nextElement = getNextElement(evt.clientY, currentElement);

    function getNextElement(cursorPosition, currentElement) {
      // Получаем объект с размерами и координатами
      const currentElementCoord = currentElement.getBoundingClientRect();
      // Находим вертикальную координату центра текущего элемента
      const currentElementCenter =
        currentElementCoord.y + currentElementCoord.height / 2;

      // Если курсор выше центра элемента, возвращаем текущий элемент
      // В ином случае — следующий DOM-элемент
      const nextElement =
        cursorPosition < currentElementCenter
          ? currentElement
          : currentElement.nextElementSibling;

      return nextElement;
    }

    // Нужно ли менять элементы местами
    if (
      (nextElement && activeElement === nextElement.previousElementSibling) ||
      activeElement === nextElement
    ) {
      return;
    }
    console.log(activeTaskList.querySelectorAll(".task-item").length);
    if (activeTaskList.querySelectorAll(".task-item").length <= 2) {
      activeTaskList.querySelector(".task-default").classList.remove("hide");
    }

    const activeTaskListDefaultItem = nextElement.parentElement.querySelector(
      ".task-default"
    );
    if (!activeTaskListDefaultItem.classList.contains("hide")) {
      activeTaskListDefaultItem.classList.add("hide");
    }
    taskList.insertBefore(activeElement, nextElement);
  });
}
/*****************************c****************************************************/

/****************************** Создание задач ***********************************/
/**
 * Создает задачу
 *
 * @param {string} taskName Название задачи
 * @return {object} taskItem Узел DOM с задачей
 */
function createTask(taskName) {
  let taskItem = document.querySelector("#task-item-template").content.cloneNode(true);
  addDeleteTaskHandler(taskItem.querySelector(".task-delete"));
  addEventListenerOnBlur(taskItem.querySelector(".task-input"));
  addEventListenerOnDoubleClick(taskItem.querySelector(".task-body"));
  taskItem.querySelector(".task-view").textContent = taskName;

  return taskItem;
}

/**
 * Создает задачу по-умолчанию - заглушка
 *
 * @param {string} taskName Название задачи
 * @return {object} taskItem Узел DOM с задачей
 */
function createDefaultTask() {
  // Create base elements
  let taskItem = document.createElement("div");
  let taskBody = document.createElement("div");
  let taskView = document.createElement("p");
  let taskInput = document.createElement("input");

  //Add necessary properties and methods
  taskItem.classList.add("task-item");
  taskItem.classList.add("task-default");
  taskBody.classList.add("task-body");
  taskView.classList.add("task-view");
  taskView.textContent = "Пусто";
  taskInput.classList.add("task-input");
  taskInput.type = "text";
  taskInput.value = "Пусто";

  //Construct task
  taskBody.appendChild(taskView);
  taskBody.appendChild(taskInput);
  taskItem.appendChild(taskBody);

  return taskItem;
}

/**
 * Добавляет обработчик для удаления задачи
 * @param {object} deleteTask Объект кнопки удаления
 */
function addDeleteTaskHandler(deleteTask) {
  deleteTask.onclick = function () {
    if (confirm("Удалить?")) {
      let taskItems = deleteTask.parentElement.parentElement;
      deleteTask.parentElement.remove();
      taskItems = taskItems.querySelectorAll(".task-item");
      if (taskItems.length == 1) {
        taskItems[0].classList.remove("hide");
      }
    }
  };
}

/**
 * Добавляет обработчик для добавления задачи в список
 */
function addTaskHandler(taskAddButton) {
  taskAddButton.onclick = function () {
    let taskName = prompt("Новая задача", "Новая задача");
    if (taskName) {
      let newTask = createTask(taskName);
      let taskDefault = taskAddButton.parentElement.querySelector(
        ".task-default"
      );
      if (!taskDefault.classList.contains("hide")) {
        taskDefault.classList.add("hide");
      }
      taskAddButton.parentElement.prepend(newTask);
    }
  };
}
/*********************************************************************************/

/******************** Сохранение состояния в localStorage ************************/

window.addEventListener(`beforeunload`, (evt) => {
  let storedItem = localStorage.getItem("savedBoard");
  if (storedItem) {
    localStorage.removeItem(`savedBoard`);
  }
  localStorage.setItem(
    "savedBoard",
    document.querySelector(".task-board").innerHTML
  );
});

/**
 * Восстановление сессии из localStorage
 */
function restoreSession() {
  let storedItem = localStorage.getItem("savedBoard");
  if (storedItem) {
    document.querySelector(".task-board").innerHTML = storedItem;
  }
}

/*********************************************************************************/