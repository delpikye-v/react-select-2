<div align="center">
    <h1>react-select-2z</h1>
    <a href="https://codesandbox.io/s/5zuwr">LIVE EXAMPLE</a>
</div>

---

#### Description

+ React select2. (Cutomize template option)

+ Apply `perfect-scrollbar`

---

#### Usage
```js
npm install react-select-2z
```

Import the module in the place you want to use:
```js

// import main.js
import 'select2/dist/js/select2.min.js'
import 'select2/dist/css/select2.min.css'
import 'perfect-scrollbar/css/perfect-scrollbar.css'

// import you component
import ReactSelect2 from 'react-select-2z'
import 'react-select-2z/build/styles.css'
```

#### Snippet


```js
    <ReactSelect2
        multiple={true}
        selectedValues={selected}
        options={state}
        // templateOption={templateOption} // customize template
        // templateDisplay={templateDisplay} // customize template
        // customSelected={customSelected}
        // customSearch={customSearch}
        keyLabel='title'
        keyValue='id'
        placeholder='Select item'
        // disabled
      />
```
<br />


---

#### props
###### TreeItem
| **props**               | **type** | **description**                                                                  |
|-------------------------|----------|------------------------------------------------------------                      |


#####

<br />


<br />

#### RUN

<a href="https://codesandbox.io/s/5zuwr">LIVE EXAMPLE</a>

```js
npm install
```
```js
npm run dev
npm run start
```

### License

MIT
