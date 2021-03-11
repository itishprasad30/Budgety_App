// Budget Controller

var budgetController = (function () {

    //some code
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };


    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };


    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItem[type].forEach(function (curr) {
            sum = sum + curr.value;
        });
        data.totals[type] = sum;
        /*
        0
        [200, 400, 100]
        sum = 0 + 200
        sum = 200 + 400
        sum = 600 + 100 =700
        */
    };

    // var allExpenses = [];
    // var allIncome = [];
    // var totalExpenses = 0;

    var data = {

        allItem: {
            exp: [],
            inc: []

        },
        totals: {
            exp: 0,
            inc: 0

        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            //[1 2 3 4 5], next Id =6
            //[1 2 4 6 7],next ID =9
            //ID =last id +1
            //create new ID
            if (data.allItem[type].length > 0) {
                ID = data.allItem[type][data.allItem[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //create new item based on inc or exp type
            if (type === 'exp') {

                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            //Push it into our data structure

            data.allItem[type].push(newItem);
            //return the element

            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;
            // id =6
            //data.allItem[type][id];
            // id  = [1 2 4 6  8]
            //index =3

            ids = data.allItem[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItem[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            // Calculate total expenses and income
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate the budget : income - expense
            data.budget = data.totals.inc - data.totals.exp;
            // calculate the percentage of income  that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

            //Expense = 100 and  inc = 200 ,spent 50%=100/200
        },

        calculatePercentages: function () {

            /*
            a=20
            b=10
            c=40
            income = 100
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%
            */

            data.allItem.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },


        getPercentages: function () {
            var allPerc = data.allItem.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,

            }
        },

        testing: function () {
            console.log(data);

        }
    };


})();


// UI Controller

var UIController = (function () {

    var DOMstring = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'



    };
    var formatNumber = function (num, type) {
        var numSplit, int, dec, type;
        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands
            2310.4567 -> + 2,310.46
            2000 -> + 2,000.00
            */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };




    // Some code
    return {
        getinput: function () {

            return {
                type: document.querySelector(DOMstring.inputType).value,//will be either inc or exp
                description: document.querySelector(DOMstring.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstring.inputValue).value)

            };

        },


        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstring.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstring.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorId) {
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstring.inputDescription + ', ' + DOMstring.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";

            });
            // Foucus will back to the description...
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstring.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstring.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstring.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstring.percentageLabel).textContent = obj.percentage + '%';

            } else {
                document.querySelector(DOMstring.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function (percentages) {

            var fields = document.querySelectorAll(DOMstring.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });

        },

        displayMonth: function () {
            var now, year, month;
            now = new Date();
            //var christmas = new Date (2020, 11, 25)
            months = ['January', 'Fabuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstring.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function () {
            var fields = document.querySelectorAll(
                DOMstring.inputType + ',' +
                DOMstring.inputDescription + ',' +
                DOMstring.inputValue);


            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstring.inputBtn).classList.toggle('red');


        },


        getDOMstring: function () {
            return DOMstring;
        }
    }

})();


//Global APP Controller

var controller = (function (budgetctrl, UIctrl) {

    var setupEventListener = function () {
        var DOM = UIctrl.getDOMstring();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }

        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType);

    };




    var updateBudget = function () {

        // 1.Calculate the budget
        budgetctrl.calculateBudget();


        // 2. return the  budget
        var budget = budgetctrl.getBudget();

        // 3.Display the budget on the UI
        // console.log(budget);
        UIctrl.displayBudget(budget);


    };

    var updatePercentages = function () {

        // 1. Calculate percentages
        budgetctrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetctrl.getPercentages();

        // 3. Update the UI with the new percentages
        UIctrl.displayPercentages(percentages);
        // console.log(percentages);

    };

    var ctrlAddItem = function () {
        var input, newItem;
        // 1.Get the filled input data
        var input = UIctrl.getinput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2.Add the item to the budget controller
            var newItem = budgetctrl.addItem(input.type, input.description, input.value);

            // 3.Add the item to the UI
            UIctrl.addListItem(newItem, input.type);

            // 4.Clear the fields
            UIctrl.clearFields();

            // 5.calculate and update budget
            updateBudget();

            //6. calculate and Update the Percentages
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function (event) {
        var itemID, spliltID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            //inc-1
            spliltID = itemID.split('-');
            type = spliltID[0];
            ID = parseInt(spliltID[1]);

            // 1. delete the item from data structure
            budgetctrl.deleteItem(type, ID);
            // 2 . Delete the item from UI
            UIctrl.deleteListItem(itemID);
            // 3. Upadate and show the new budget
            updateBudget();
            //4. Calculate and Update the Percentages
            updatePercentages();


        }

    };
    return {
        init: function () {
            console.log('Application has Started.');
            UIctrl.displayMonth();
            UIctrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1

            });
            setupEventListener();

        }
    };

})(budgetController, UIController);

controller.init();