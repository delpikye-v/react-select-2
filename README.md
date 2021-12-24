<div align="center">
    <h1>react-select-2z</h1>
    <a href="https://codesandbox.io/s/5zuwr">LIVE EXAMPLE</a>
</div>

---

#### Description

+ React select2. Basic with multi choice. (Cutomize template option)

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
        // templateOption={templateOption} // customize template (option) (html)
        // templateDisplay={templateDisplay} // customize selected values (html)
        // customCheckSelect={customCheckSelect} // customize check selected
        // customFilterData={customFilterData} // customize check search
        keyLabel='title'
        keyValue='id' // when options = [1, 2, 3, 4...]  (no need keyValue & keyLabel)
        placeholder='Select item'
        // disabled
      />
```
<br />


---

#### props
Some main select2 advance checking...

| **props**               | **type** | **description**                                            |
|-------------------------|----------|------------------------------------------------------------|
|id                       |          |                                                            |
|options = []             |          |                                                            |
|selectedValues = []      |          |                                                            |
|onChange                 |          |                                                            |
|className                |          |                                                            |
|required = false         |          |                                                            |
|disabled = false         |          |                                                            |
|multiple = false         |          |                                                            |
|optionClassName          |          |                                                            |
|selectedClassName        |          |                                                            |
|maximumSelectionLength   | number   |  Need update > 0. Default nolimit                          |
|keyLabel                 |          |  list object (key for selected)                            |
|keyValue                 |          |  list object (label for selected)                          |
|closeOnSelect            | boolean  |  Default. (False)                                          |
|placeholder              |          |                                                            |
|noFoundData              | func     |  set text when search no data                              |
|noOptionData             | func     |  set text when no option                                   |
|onHidden                 | func     |                                                            |
|select2Config = {}       |          |                                                            |
|templateOption           |          |                                                            |
|templateDisplay          |          |                                                            |
|customCheckSelect        | func     |                                                            |
|customFilterData         | func     |                                                            |

#####

<br />

Something checking! (idea, v.v..)
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
