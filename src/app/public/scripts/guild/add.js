
function updateGuildChannels() {

    let urlParameters = new URLSearchParams(window.location.search)
    let guildId = urlParameters.get('guild_id')
    let cookies = document.cookie.split('; ').map((cookie) => cookie.split('='))
    let accessToken = (cookies.filter((cookie) => cookie[0] == 'access_token'))[0][1]

    return $.ajax({
        type: 'POST',
        url: `/guild/${guildId}/channels`,
        data: { access_token: accessToken },
        success: function (data) {

            let options = ''

            for (let channel of data) {

                options += `\n<option value="${channel.id}">${channel.id} (${channel.name})</option>`
            }

            $('#alert-channel-select').html(options)
            $('#log-channel-select').html(options)
        }
    })
}

$('[type=checkbox]').on('change', function (event) {

    let enableAutoChannels = $('#auto-channels-checkbox').prop('checked')
    let enableLogChannel = $('#enable-log-channel-checkbox').prop('checked')

    $('#config-form-manual-channels-div').css('display', (enableAutoChannels ? 'none' : 'flex'))
    $('#alert-channel-select').prop('disabled', enableAutoChannels)
    $('#log-channel-select').prop('disabled', (!enableLogChannel || enableAutoChannels))
})

$('#config-form-manual-channels-refresh').on('click', function (event) {

    updateGuildChannels()
})
