//*************** Variant 1 ***********************

let firstPhrase = [];

const findText = async (file) => {
  const response = fetch(`https://fe.it-academy.by/Examples/words_tree/${file}`);
  try {
    const value = await response;
    const data = value.json().catch(er => {
      addTEXT(file);
    });
    const array = await data;
    for (let i = 0; i < array.length; i++) {
      await findText(array[i]);
    }
  } catch (er) {
    return null
  }
};

findText("root.txt");

const addTEXT = async (file) => {
  const response = fetch(`https://fe.it-academy.by/Examples/words_tree/${file}`);
  const word = (await response).text();
  firstPhrase = [...firstPhrase, await word];
  const method = document.getElementsByClassName("method_1")[0];
  method.innerHTML = firstPhrase.join(" ");
  console.log(firstPhrase.join(" "));
};

//*************** Variant 2 ***********************

let secondPhrase = [];

function find(file) {
  return fetch(`https://fe.it-academy.by/Examples/words_tree/${file}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (file) {
      return search(file);
    })
    .catch(function () {
      return addWord(file);
    });
}

function search(array) {
  return array.reduce((p, f) => p.then(() => find(f)), Promise.resolve());
}

function addWord(file) {
  return fetch(`https://fe.it-academy.by/Examples/words_tree/${file}`)
    .then(function (response) {
      return response.text();
    })
    .then(function (word) {
      secondPhrase = [...secondPhrase, word];
      console.log(secondPhrase.join(" "));
      const method = document.getElementsByClassName("method_2")[0];
      method.innerHTML = secondPhrase.join(" ");
    })
    .catch(function () {
      return null;
    });
}

find("root.txt");