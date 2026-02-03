export class FileApi {
  static async uploadFile(file: File, folder: string): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('token')
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    
    const response = await fetch(`${baseURL}/api/files/upload/${folder}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Upload failed')
    }

    const data = await response.json()
    
    // Retourner l'URL complète du fichier
    return data.url || data.filename
  }
}
