import React, { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import $ from 'jquery'
import PerfectScrollbar from 'perfect-scrollbar'

// import 'select2/dist/js/select2.min.js'
// import 'select2/dist/css/select2.min.css'
// import 'perfect-scrollbar/css/perfect-scrollbar.css'

import './Select2.style.scss'

$.fn.select2.amd.require(['select2/selection/search'], function(Search) {
    let oldRemoveChoice = Search.prototype.searchRemoveChoice
    Search.prototype.searchRemoveChoice = function() {
        oldRemoveChoice.apply(this, arguments)
        this.$search.val('')
        this.handleSearch()
    }
})
const isFunc = (func) => typeof func === 'function'
const uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        // eslint-disable-next-line no-mixed-operators
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

const DkzSelect2 = (props) => {
    const {
        options = [],
        selectedValues = [],
        onChange,
        className,
        disabled = false,
        multiple = false,
        optionClassName,
        maximumSelectionLength = 0,
        selectedClassName,
        keyLabel,
        keyValue,
        closeOnSelect = false,
        placeholder,
        noSearchResultFunc,
        noDataFunc,
        onHidden,
        select2Config = {},
        templateOption,
        templateDisplay,
        customSelected,
        customSearch
    } = props
    const ref = useRef()
    const [localSelected, setLocalSelected] = useState(() => selectedValues || [])

    useEffect(() => {
        buildSelect2(options.map((item, index) => buildObjectItem(item, index)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options])

    const select2ClassName = useCallback(() => `rdk-select2-component ${className || ''}`.trim(), [className])
    const hasOptions = useCallback(() => options.length > 0, [options])
    const hasKey = useCallback(() => keyValue !== null && keyValue !== undefined, [keyValue])

    // option item
    const buildObjectItem = (item, index) => {
        // using customize template
        let defaultOption = item.templateOption || templateOption
        let defaultDisplay = item.templateDisplay || templateDisplay
        let defaultSelected = item.customSelected || customSelected

        let text, option, selected

        // when you pass array single option ['1', '2', '3'....]
        let labelText = (hasKey() && item[keyLabel] !== undefined) ? item[keyLabel] : item
        let displayLabel = typeof labelText === 'object' ? JSON.stringify(labelText) : labelText

        // customize option
        if (!defaultOption) {
            option = `<span class="${optionClassName || ''}">${displayLabel}</span>`
        } else {
            option = defaultOption(item, index)
        }

        // customize selection
        if (!defaultDisplay) {
            text= `<span class="${selectedClassName || ''}">${displayLabel}</span>`
        } else {
            text = defaultDisplay(item, index)
        }

        if (defaultSelected) {
            selected = defaultSelected(item, index, localSelected)
        } else {
            if (localSelected.length > 0) {
                let index = localSelected.findIndex(o => o === (hasKey() ? item[keyValue] : item))
                selected = index !== -1
            }
        }

        return {
            id: uuid(),
            text,
            option,
            title: displayLabel,
            selected,
            disabled: item.disabled,
            displayLabelSearch: `${displayLabel}`.toLowerCase(),
            selfData: item,
        }
    }

    const matchCustom = ({ term }, item) => {
        if (isFunc(customSearch)) {
            return customSearch(item.selfData, term) ? item : null
        }
        if (term === null || term === undefined) {
            return item
        }

        if (!item.selfData) {
            return null
        }

        let nTerm = `${term}`.trim().toLowerCase() // trim and lower from param
        let label = `${item.displayLabelSearch}`.toLowerCase().trim()
        if (label.includes(nTerm)) {
            return item
        }
        return null
    }

    const buildSelect2 = (opt = []) => {
        let el = $(ref.current)
        try {
            if (el.data && el.data('select2')) {
                el.select2('destroy')
            }
        } catch (e) {}

        // make select2
        let config = () => {
            return {
                data: opt,
                placeholder,
                width: '100%',
                matcher: matchCustom,
                escapeMarkup: markup => markup,
                templateSelection: data => data.text,
                templateResult: data => data.option,
                closeOnSelect: closeOnSelect,
                selectionTitleAttribute: false,
                language: {
                    noResults: () => {
                        let keySearch = el.data('select2').selection.$search.val()
                        if (!hasOptions()) {
                            return isFunc(noDataFunc) ? noDataFunc() : 'No options!'
                        }
                        if (isFunc(noSearchResultFunc)) {
                            return noSearchResultFunc(`${keySearch}`.trim())
                        }
                        return `No found ${keySearch}!`
                    }
                },
                ...select2Config
            }
        }
        let newConfig = config()
        if (maximumSelectionLength > 0) {
            newConfig.maximumSelectionLength = maximumSelectionLength
        }
        el.select2(newConfig)

        // ===============================================================
        // ===============================================================
        // Event config
        // ===============================================================
        let { $container, selection } = el.data('select2')
        let tmpPos = 0

        let selectScrollbar = null
        let optionScrollbar = null

        const containSelectin = $container.find('> .selection')

        function onTempChange(isSelected) {
            let selectionData = el.data('select2').data()

            let tempSelected = []
            // this is object
            if (hasKey()) {
                tempSelected = selectionData.map(({ selfData }) => selfData[keyValue] )
            } else {
                tempSelected = selectionData.map(({ selfData }) => selfData )
            }

            if (isFunc(onChange)) {
                onChange(tempSelected) // notify parent
            }
            setLocalSelected(tempSelected)

            selectScrollbar = makeSelectionScrollbar([containSelectin, selectScrollbar, selection.$search, isSelected])
        }
        el.on('select2:select', () => onTempChange(true))
        el.on('select2:unselect', () => onTempChange(false))

        el.on('select2:open', function() {
            let dropdown = el.data('select2').$dropdown
            optionScrollbar = makeOptionScrollbar(dropdown, tmpPos, optionScrollbar)

            // scroll to view input
            containSelectin[0].scrollTop = containSelectin[0].scrollHeight
            setTimeout(() => {
                let target = multiple ? 'selection' : 'dropdown'
                let searchBox = el.data('select2')[target].$search
                searchBox[0] && searchBox[0].focus()
            }, 100);
        })

        el.on('select2:close', function() {
            isFunc(onHidden) && onHidden()
            optionScrollbar = removeOptionScrollbar(optionScrollbar)
        })

        el.on('select2:closing', function(evt) {
            let dropdown = el.data('select2').$dropdown
            tmpPos = dropdown.find('.select2-results')[0].scrollTop
        })

        selectScrollbar = makeSelectionScrollbar([containSelectin, selectScrollbar, selection.$search, false, 0])
    }

    const makeSelectionScrollbar = ([selectionBox, selectionScrollbar, elSearch, isNew, pos]) => {
        if (!hasOptions()) {
            return
        }

        if (pos === 0) {
            selectionBox[0].scrollTop = 0
        } else {
            if (isNew) {
                selectionBox[0].scrollTop = selectionBox[0].scrollHeight
            }
            elSearch && elSearch.focus()
        }

        if (selectionScrollbar) {
            selectionScrollbar.destroy()
            selectionScrollbar = undefined
        }

        selectionScrollbar = new PerfectScrollbar(selectionBox[0], {
            suppressScrollX: true
        })
        return selectionScrollbar
    }

    const makeOptionScrollbar = ($dropdown, scrollTop = 0, optionScrollbar) => {
        if (!hasOptions()) {
            return
        }

        if (optionScrollbar) {
            optionScrollbar.update()
            return
        }

        let listBox = $dropdown.find('.select2-results')
        listBox && (listBox[0].scrollTop = scrollTop)
        $dropdown.addClass('rdk-select2-list-item')
        listBox = $dropdown.find('.select2-results')
        optionScrollbar = new PerfectScrollbar(listBox[0], {
            minScrollbarLength: 20
        })
        setTimeout(() => optionScrollbar.update(), 100)
        return optionScrollbar
    }

    const removeOptionScrollbar = (optionScrollbar) => {
        if (optionScrollbar) {
            optionScrollbar.destroy()
            return undefined
        }
    }

    return (
        <span className={select2ClassName()}>
            <select
                ref={ref}
                disabled={disabled}
                multiple={multiple}
            >
            </select>
        </span>
    )
}

export default DkzSelect2

DkzSelect2.prototype = {
    options: PropTypes.array,
    selectedValues: PropTypes.array,
    onChange: PropTypes.func,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    multiple: PropTypes.bool,
    optionClassName: PropTypes.string,
    selectedClassName: PropTypes.string,
    maximumSelectionLength: PropTypes.number,
    keyLabel: PropTypes.string,
    keyValue: PropTypes.string,
    closeOnSelect: PropTypes.bool,
    placeholder: PropTypes.string,
    noSearchResultFunc: PropTypes.func,
    noDataFunc: PropTypes.func,
    onHidden: PropTypes.func,
    select2Config: PropTypes.object,
    templateOption: PropTypes.func, // html customize (not jsx)
    templateDisplay: PropTypes.func,
    customSelected: PropTypes.func,
    customSearch: PropTypes.func
}