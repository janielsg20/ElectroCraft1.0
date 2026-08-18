const IR = {
  "fingerprint": "01faceab0d9309d7",
  "route": "/appointments",
  "model": "Appointment",
  "query": {
    "id": "listAppointments",
    "source": "internal",
    "model": "Appointment",
    "operation": "list",
    "orderBy": [
      "startsAt:asc"
    ]
  },
  "actionGraph": {
    "id": "createAppointment",
    "trigger": "form.submit",
    "nodes": [
      {
        "id": "validate",
        "kind": "validate",
        "schema": "Appointment"
      },
      {
        "id": "create",
        "kind": "data.create",
        "model": "Appointment",
        "after": [
          "validate"
        ]
      },
      {
        "id": "refresh",
        "kind": "query.invalidate",
        "queryId": "listAppointments",
        "after": [
          "create"
        ]
      }
    ]
  }
};
document.querySelector('#appointment-form').addEventListener('submit',(event)=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));document.querySelector('#result').textContent=JSON.stringify({target:'capacitor',route:IR.route,model:IR.model,data,irFingerprint:IR.fingerprint},null,2);});
