
$('.colour').on('click', function () { // normal function notation so that $(this) returns correct object

    let colour = $(this).css("background-color").match(/[\d]{1,3}/g).map(n => parseInt(n).toString(16)).join('')

    navigator.clipboard.writeText(colour)

    let time = 2000

    $(this).css("animation", `copy ${time}ms`)

    setTimeout(() => {

        $(this).css("animation", "")

    }, time)
})
