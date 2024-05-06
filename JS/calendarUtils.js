const CLIENT_ID = '744775517567-h2b5m9a20r4l6o53gq3uqr4tkc781t15.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDObVD6ejEPQ7B0edYr1LZj5Tb4dqcCK5I';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const CALENDAR_ID = '6a56a95b071dcf30ed7709246064b33dfd7342b74c58bc10d178072e43b191f5@group.calendar.google.com'
const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';

let eventRes;
let tokenClient;
let gapiInited = false;
let gisInited = false;

function gapiLoaded() {
    gapi.load("client", initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    console.log("new gapiloaded");
}

async function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
    });
    gisInited = true;
    console.log("new gisLoaded");
}

function validateConsent() {
    return new Promise((resolve, reject) => {
        setExistingToken()
        if (gapi.client.getToken() === null || isCookieExpired()) {
            alert('Token has expired or consent is not establised, please authorize for google resource access');
            requestToken();
            tokenClient.callback = (response) => {
                if (response.error !== undefined) {
                    reject(response); // Reject the Promise with error
                } else {
                    saveToken(response);
                    resolve(); // Resolve the Promise on successful validation
                }
            };
            // Consider alternative approaches if setExistingToken is necessary
            // setExistingToken();
        } else {
            resolve(); // Resolve the Promise if consent is already validated
        }
    });
}

function setExistingToken() {
    if (gapi.client.getToken() === null && getCookie('TOKEN_RESPONSE')) {
        coToken = {
            'access_token': getCookie('TOKEN_RESPONSE')
        }
        gapi.client.setToken(coToken);
    }
}

function requestToken() {
    return tokenClient.requestAccessToken({ prompt: "consent" });
}



function isCookieExpired() {
    return Date.now() >= getCookie('EXPIRY_MILLI');
}

function saveToken(response) {
    let expiry = new Date();
    expiry.setTime(expiry.getTime() + (response.expires_in * 1000));
    setCookie('TOKEN_RESPONSE', response.access_token, expiry);
    setCookie('EXPIRY_MILLI', expiry.getTime(), '');

}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
        .replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
}

async function funcOps(ops, event, resource = null) {
    await validateConsent().then(() => {
        switch (ops) {
            case 'CREATE': {
                eventRes = scheduleEvent(event);
            } break;
            case 'READ': {
                //getEvents();
            } break;
            case 'UPDATE': {
                updateEvent(event, resource);
            } break;
            case 'DELETE': {
                deleteEvent(event)
            }
        }
    })
}

async function deleteEvent(eventId) {
    const request = gapi.client.calendar.events.delete({
        'calendarId': CALENDAR_ID,
        'eventId': eventId
    });
    request.execute(function () {
        console.log('Event Deleted!');
    });
}

async function updateEvent(eventId, resource) {
    const request = gapi.client.calendar.events.update({
        'calendarId': CALENDAR_ID,
        'eventId': eventId,
        'resource': resource
    });

    request.execute(function () {
        console.log('Event Updated!');
    });
}

function scheduleEvent(newEv) {
  const request = gapi.client.calendar.events.insert({
    'calendarId': CALENDAR_ID,
    'conferenceDataVersion': 1,
    'resource': newEv
  });

  return new Promise((resolve, reject) => {
    request.execute((event) => {
      if (event.error) {
        reject(event.error); // Handle errors
      } else {
        console.log('Event created: ' + event.htmlLink);
        resolve(event.result); // Resolve with the result
      }
    });
  });
}

async function wait(milisec) {
    await new Promise(resolve => {
        return setTimeout(resolve, milisec)
    })
}



function getEventRes() {
    return eventRes;
}

async function getEvents() {
    try {
        let resp = await gapi.client.calendar.events.list({
            'calendarId': CALENDAR_ID,
            'timeZone': 'Asia/Manila'
        });
        return resp;
    } catch (error) {
        alert(`Error at getEvents ${error}`)
        return 0;
    }
}





