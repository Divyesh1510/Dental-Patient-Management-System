fetch("https://dental-sms-api.radhikasuperspecialitydentalhospital.workers.dev", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({name:"Test", phone:"1234567890"})
}).then(async r => console.log(r.status, await r.text()))
