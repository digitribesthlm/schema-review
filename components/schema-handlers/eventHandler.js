// Event schema handler
export const handleEventFields = (schemaData) => {
  const fields = {}
  
  if (schemaData.name) {
    fields.name = {
      value: schemaData.name,
      field_type: 'text',
      editable: true,
      description: 'Event name'
    }
  }
  
  if (schemaData.description) {
    fields.description = {
      value: schemaData.description,
      field_type: 'textarea',
      editable: true,
      description: 'Event description'
    }
  }
  
  if (schemaData.startDate) {
    fields.startDate = {
      value: schemaData.startDate,
      field_type: 'date',
      editable: true,
      description: 'Event start date'
    }
  }
  
  if (schemaData.endDate) {
    fields.endDate = {
      value: schemaData.endDate,
      field_type: 'date',
      editable: true,
      description: 'Event end date'
    }
  }
  
  // Location details
  if (schemaData.location?.name) {
    fields.locationName = {
      value: schemaData.location.name,
      field_type: 'text',
      editable: true,
      description: 'Event venue name'
    }
  }
  
  if (schemaData.location?.address?.streetAddress) {
    fields.locationAddress = {
      value: schemaData.location.address.streetAddress,
      field_type: 'text',
      editable: true,
      description: 'Venue street address'
    }
  }
  
  if (schemaData.location?.address?.addressLocality) {
    fields.locationCity = {
      value: schemaData.location.address.addressLocality,
      field_type: 'text',
      editable: true,
      description: 'Venue city'
    }
  }
  
  if (schemaData.location?.address?.addressCountry) {
    fields.locationCountry = {
      value: schemaData.location.address.addressCountry,
      field_type: 'text',
      editable: true,
      description: 'Venue country'
    }
  }
  
  // Organizer details
  if (schemaData.organizer?.name) {
    fields.organizerName = {
      value: schemaData.organizer.name,
      field_type: 'text',
      editable: true,
      description: 'Event organizer name'
    }
  }
  
  if (schemaData.organizer?.url) {
    fields.organizerUrl = {
      value: schemaData.organizer.url,
      field_type: 'url',
      editable: true,
      description: 'Organizer website'
    }
  }
  
  // Offers details
  if (schemaData.offers?.price) {
    fields.offerPrice = {
      value: schemaData.offers.price,
      field_type: 'text',
      editable: true,
      description: 'Ticket price'
    }
  }
  
  if (schemaData.offers?.description) {
    fields.offerDescription = {
      value: schemaData.offers.description,
      field_type: 'textarea',
      editable: true,
      description: 'Offer details'
    }
  }
  
  // Agenda items
  if (schemaData.agenda && Array.isArray(schemaData.agenda)) {
    schemaData.agenda.forEach((item, index) => {
      if (item.name) {
        fields[`agenda_${index}`] = {
          value: item.name,
          field_type: 'text',
          editable: true,
          description: `Agenda item #${index + 1}`
        }
      }
    })
  }
  
  // Speakers
  if (schemaData.speakers && Array.isArray(schemaData.speakers)) {
    schemaData.speakers.forEach((speaker, index) => {
      if (speaker.name) {
        fields[`speaker_${index}_name`] = {
          value: speaker.name,
          field_type: 'text',
          editable: true,
          description: `Speaker #${index + 1} name`
        }
      }
      
      if (speaker.worksFor?.name) {
        fields[`speaker_${index}_company`] = {
          value: speaker.worksFor.name,
          field_type: 'text',
          editable: true,
          description: `Speaker #${index + 1} company`
        }
      }
      
      if (speaker.url) {
        fields[`speaker_${index}_url`] = {
          value: speaker.url,
          field_type: 'url',
          editable: true,
          description: `Speaker #${index + 1} profile URL`
        }
      }
    })
  }
  
  return fields
}

export const getEventInitialFields = (schemaData) => {
  const initialFields = {}
  
  if (schemaData.name) initialFields.name = schemaData.name
  if (schemaData.description) initialFields.description = schemaData.description
  if (schemaData.startDate) initialFields.startDate = schemaData.startDate
  if (schemaData.endDate) initialFields.endDate = schemaData.endDate
  
  // Location details
  if (schemaData.location?.name) initialFields.locationName = schemaData.location.name
  if (schemaData.location?.address?.streetAddress) initialFields.locationAddress = schemaData.location.address.streetAddress
  if (schemaData.location?.address?.addressLocality) initialFields.locationCity = schemaData.location.address.addressLocality
  if (schemaData.location?.address?.addressCountry) initialFields.locationCountry = schemaData.location.address.addressCountry
  
  // Organizer details
  if (schemaData.organizer?.name) initialFields.organizerName = schemaData.organizer.name
  if (schemaData.organizer?.url) initialFields.organizerUrl = schemaData.organizer.url
  
  // Offers details
  if (schemaData.offers?.price) initialFields.offerPrice = schemaData.offers.price
  if (schemaData.offers?.description) initialFields.offerDescription = schemaData.offers.description
  
  // Agenda items
  if (schemaData.agenda && Array.isArray(schemaData.agenda)) {
    schemaData.agenda.forEach((item, index) => {
      if (item.name) initialFields[`agenda_${index}`] = item.name
    })
  }
  
  // Speakers
  if (schemaData.speakers && Array.isArray(schemaData.speakers)) {
    schemaData.speakers.forEach((speaker, index) => {
      if (speaker.name) initialFields[`speaker_${index}_name`] = speaker.name
      if (speaker.worksFor?.name) initialFields[`speaker_${index}_company`] = speaker.worksFor.name
      if (speaker.url) initialFields[`speaker_${index}_url`] = speaker.url
    })
  }
  
  return initialFields
}
