import { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import $ from 'jquery'
import PerfectScrollbar from 'perfect-scrollbar'

import { useWindowSize } from './Select2.useHook'

/*
import it from main.js
import 'select2/dist/js/select2.min.js'
import 'select2/dist/css/select2.min.css'
import 'perfect-scrollbar/css/perfect-scrollbar.css'
*/

import './Select2.style.scss'

const isFunc = func => typeof func === 'function'
const uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        // eslint-disable-next-line no-mixed-operators
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16)
    })
}

const arrowNext = 'ArrowDown'
const arrowBack = 'ArrowUp'
const arrowKey = [arrowNext, arrowBack]

const DkzSelect2 = props => {
    const {
        id,
        options = [],
        selectedValues = [],
        onChange,
        className,
        required,
        disabled = false,
        multiple = false,
        optionClassName,
        selectedClassName,
        maximumSelectionLength = 0,
        keyLabel,
        keyValue,
        closeOnSelect = false,
        placeholder,
        noFoundData,
        noOptionData,
        onHidden,
        select2Config = {},
        templateOption,
        templateDisplay,
        customCheckSelect,
        customFilterData
    } = props
    const ref = useRef()
    const refScrollSelection = useRef(null)
    const refScrollOption = useRef(null)

    const [localSelected, setLocalSelected] = useState(() => selectedValues || [])

    const resize = useWindowSize()
    // const refScroll
    useEffect(() => {
        let local = true
        // (0.2.5-samd)
        $.fn.select2.amd.require(['select2/selection/search'], function(Search) {
            let oldRemoveChoice = Search.prototype.searchRemoveChoice
            oldRemoveChoice = Search.prototype.searchRemoveChoice
            Search.prototype.searchRemoveChoice = function() {
                oldRemoveChoice.apply(this, arguments)
                if (local) {
                    this.$search.val('')
                    this.handleSearch()
                }
            }
        })
        return destroyedSelect2()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        /** Need rebuil select2 when selectedValues */
        buildSelect2(options.map((item, index) => buildObjectItem(item, index)))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options])

    useEffect(() => {
        /** Need update scrollbar when window resize  */
        refScrollOption.current && refScrollOption.current.update()
        refScrollSelection.current && refScrollSelection.current.update()
    }, [resize])

    const select2ClassName = useCallback(() => `rdk-select2-component ${className || ''}`.trim(), [className])
    const hasOptions = useCallback(() => options.length > 0, [options])
    const hasKey = useCallback(() => keyValue !== null && keyValue !== undefined, [keyValue])

    const destroyedSelect2 = () => {
        let el = $(ref.current)
        try {
            if (el.data('select2')) {
                el.off('select2:select');
                el.off('select2:unselect');
                el.off('select2:open');
                el.off('select2:close');
                el.off('select2:closing');
                el.select2('destroy')
            }
            // eslint-disable-next-line no-empty
        } catch {}
    }

    // option item
    const buildObjectItem = (item, index) => {
        // using customize template
        let defaultOption = item.templateOption || templateOption
        let defaultDisplay = item.templateDisplay || templateDisplay
        let defaultSelected = item.customCheckSelect || customCheckSelect

        let text, option, selected

        // when you pass array single option ['1', '2', '3'....]
        let labelText = hasKey() && item[keyLabel] !== undefined ? item[keyLabel] : item
        let displayLabel = typeof labelText === 'object' ? JSON.stringify(labelText) : labelText

        // customize option
        if (isFunc(defaultOption)) {
            option = defaultOption(item, index)
        } else {
            option = `<span class="${optionClassName || ''}">${displayLabel}</span>`
        }

        // customize selection
        if (isFunc(defaultDisplay)) {
            text = defaultDisplay(item, index)
        } else {
            text = `<span class="${selectedClassName || ''}">${displayLabel}</span>`
        }

        if (isFunc(defaultSelected)) {
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
            selfData: item
        }
    }

    const matchCustom = ({ term }, item) => {
        if (isFunc(customFilterData)) {
            return customFilterData(item.selfData, term) ? item : null
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
        destroyedSelect2()

        let targetSearch = multiple ? 'selection' : 'dropdown'
        const hasOpt = opt.length !== 0
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
                        let keySearch = el.data('select2')[targetSearch].$search.val()
                        if (hasOpt) {
                            return isFunc(noOptionData) ? noOptionData() : 'No options!'
                        }
                        if (isFunc(noFoundData)) {
                            return noFoundData(`${keySearch}`.trim())
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

        let el = $(ref.current)
        el.select2(newConfig)

        // ===============================================================
        // ===============================================================
        // Event config
        // ===============================================================
        let { $container } = el.data('select2')
        let tmpPos = 0

        const containerSelection = $container.find('> .selection')
        let searchInput = el.data('select2')[targetSearch].$search

        function onTempChange(isSelected) {
            let selectionData = el.data('select2').data()
            let tempSelected = []

            if (hasKey()) {
                tempSelected = selectionData.map(({ selfData }) => selfData[keyValue])
            } else {
                tempSelected = selectionData.map(({ selfData }) => selfData)
            }

            isFunc(onChange) && onChange(tempSelected) // notify parent
            setLocalSelected(tempSelected)
            hasOpt && makeSelectionScrollbar([containerSelection, searchInput, isSelected])
        }

        el.on('select2:select', () => onTempChange(true))
        el.on('select2:unselect', () => onTempChange(false))

        el.on('select2:open', function() {
            let dropdown = el.data('select2').$dropdown
            makeOptionScrollbar(dropdown, tmpPos)
            searchInput.focus()

            // scroll to view input
            if (multiple) {
                containerSelection.animate({ scrollTop: containerSelection[0].scrollHeight }, 250)
            }
        })

        el.on('select2:close', function() {
            isFunc(onHidden) && onHidden()
        })

        el.on('select2:closing', function() {
            let dropdown = el.data('select2').$dropdown
            tmpPos = dropdown.find('.select2-results')[0].scrollTop
        })

        searchInput[0].addEventListener('keyup', function(evt) {
            if (refScrollOption.current) {
                if (arrowKey.includes(evt.key)) {
                    let hl = el.data('select2').$dropdown.find('.select2-results__option--highlighted')
                    let hlOffset = hl.offset()

                    let { element } = refScrollOption.current
                    let scrollTop = element.scrollTop
                    let diff = hlOffset.top - $(element).offset().top

                    if (arrowBack === evt.key) {
                        if (diff < hl.height()) {
                            $(element).animate({ scrollTop: scrollTop + diff }, 250)
                        }
                    } else {
                        let maxOver = element.clientHeight - hl.height()
                        if (diff > maxOver) {
                            $(element).animate({ scrollTop: scrollTop + diff - maxOver + hl.height() }, 250)
                        }
                    }
                }
                refScrollOption.current.update()
            }
        })

        hasOpt && makeSelectionScrollbar([containerSelection, searchInput, false, 0])
    }

    const makeSelectionScrollbar = ([selectionBox, elSearch, isNew, pos]) => {
        if (!multiple) {
            return
        }
        if (pos === 0) {
            selectionBox[0].scrollTop = 0
        } else {
            isNew && selectionBox.animate({ scrollTop: selectionBox[0].scrollHeight }, 250)
            isNew && elSearch.focus()
        }

        if (refScrollSelection.current) {
            refScrollSelection.current.update()
            return
        }

        refScrollSelection.current = new PerfectScrollbar(selectionBox[0], {
            suppressScrollX: true
        })
        setTimeout(() => refScrollSelection.current.update(), 100)
    }

    const makeOptionScrollbar = ($dropdown, scrollTop = 0) => {
        let listBox = $dropdown.find('.select2-results')
        if (listBox) {
            listBox[0].scrollTop = scrollTop
            $dropdown.addClass('rdk-select2-list-item')

            if (refScrollOption.current) {
                refScrollOption.current.update()
                return
            }

            if (!hasOptions()) {
                return
            }

            refScrollOption.current = new PerfectScrollbar(listBox[0], {
                minScrollbarLength: 20
            })
            setTimeout(() => refScrollOption.current.update(), 100)
        }
    }

    return (
        <span className={select2ClassName()}>
            <select
                id={id}
                style={{ opacity: 0 }}
                ref={ref}
                required={required}
                disabled={disabled}
                multiple={multiple}
            ></select>
        </span>
    )
}

export default DkzSelect2

DkzSelect2.prototype = {
    options: PropTypes.array,
    selectedValues: PropTypes.array,
    onChange: PropTypes.func,
    className: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    multiple: PropTypes.bool,
    optionClassName: PropTypes.string,
    selectedClassName: PropTypes.string,
    maximumSelectionLength: PropTypes.number,
    keyLabel: PropTypes.string,
    keyValue: PropTypes.string,
    closeOnSelect: PropTypes.bool,
    placeholder: PropTypes.string,
    noFoundData: PropTypes.func,
    noOptionData: PropTypes.func,
    onHidden: PropTypes.func,
    select2Config: PropTypes.object,
    templateOption: PropTypes.func, // html customize (not jsx)
    templateDisplay: PropTypes.func,
    customCheckSelect: PropTypes.func,
    customFilterData: PropTypes.func
}