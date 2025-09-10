'use client'

import { motion } from 'framer-motion'
import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, Download, Eye } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ProgressBar from '@/components/ui/ProgressBar'
import ErrorMessage from '@/components/ui/ErrorMessage'
import SuccessMessage from '@/components/ui/SuccessMessage'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/hooks/useNotifications'
import authApi from '@/lib/authApi'

interface UploadResult {
  success: boolean
  message: string
  data?: {
    total_records: number
    predictions_made: number
    high_risk_count: number
    avg_churn_score: number
    file_name: string
    predictions: Array<{
      id: string
      churn_score: number
      risk_level: string
      timestamp: string
    }>
  }
  error?: string
}

interface FileUploadComponentProps {
  onUploadSuccess?: (result: UploadResult) => void
  onUploadError?: (error: string) => void
}

export default function FileUploadComponent({ 
  onUploadSuccess, 
  onUploadError 
}: FileUploadComponentProps) {
  const { user } = useAuth()
  const { showSuccess, showError } = useNotifications()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingStage, setProcessingStage] = useState<string>('')

  // Supported file types
  const supportedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]

  const supportedExtensions = ['.csv', '.xls', '.xlsx']

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      handleFileSelect(file)
    }
  }, [])

  const handleFileSelect = (file: File) => {
    // Clear previous results
    setUploadResult(null)
    
    // Validate file type
    if (!supportedTypes.includes(file.type) && 
        !supportedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      const errorMsg = 'Please select a valid CSV or Excel file (.csv, .xls, .xlsx)'
      showError(errorMsg)
      onUploadError?.(errorMsg)
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = 'File size must be less than 10MB'
      showError(errorMsg)
      onUploadError?.(errorMsg)
      return
    }

    setSelectedFile(file)
    showSuccess(`File "${file.name}" selected successfully`)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setUploadResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadFile = async () => {
    if (!selectedFile || !user) return

    setUploading(true)
    setUploadProgress(0)
    setUploadResult(null)
    setProcessingStage('Preparing upload...')

    try {
      // Create FormData
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('user_id', user.id.toString())

      // Simulate progress updates with realistic stages
      const progressStages = [
        { progress: 10, stage: 'Uploading file...' },
        { progress: 30, stage: 'Validating file format...' },
        { progress: 50, stage: 'Processing data...' },
        { progress: 70, stage: 'Running predictions...' },
        { progress: 90, stage: 'Saving results...' }
      ]

      let currentStageIndex = 0
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (currentStageIndex < progressStages.length && prev >= progressStages[currentStageIndex].progress) {
            setProcessingStage(progressStages[currentStageIndex].stage)
            currentStageIndex++
          }
          
          if (prev >= 95) {
            clearInterval(progressInterval)
            setProcessingStage('Finalizing...')
            return prev
          }
          return prev + Math.random() * 5 + 2
        })
      }, 300)

      // Upload file
      const response = await authApi.uploadData(formData)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      setProcessingStage('Complete!')

      if (response.success) {
        const result: UploadResult = {
          success: true,
          message: response.message || 'File uploaded and processed successfully!',
          data: response.data
        }
        setUploadResult(result)
        showSuccess(result.message)
        onUploadSuccess?.(result)
      } else {
        const result: UploadResult = {
          success: false,
          message: response.error || 'Upload failed',
          error: response.error
        }
        setUploadResult(result)
        showError(result.message)
        onUploadError?.(response.error || 'Upload failed')
      }
    } catch (error) {
      clearInterval(progressInterval)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      const result: UploadResult = {
        success: false,
        message: errorMessage,
        error: errorMessage
      }
      setUploadResult(result)
      showError(`Upload failed: ${errorMessage}`)
      onUploadError?.(errorMessage)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setProcessingStage('')
    }
  }

  const downloadSampleFile = () => {
    // Create a sample CSV content
    const sampleData = `customer_id,age,gender,tenure,monthly_charges,total_charges,contract_type,payment_method,churn
1,25,Female,12,29.85,358.2,Month-to-month,Electronic check,No
2,30,Male,24,56.95,1366.8,One year,Bank transfer (automatic),No
3,45,Female,72,42.3,3045.6,Two year,Credit card (automatic),No
4,50,Male,36,70.7,2545.2,One year,Bank transfer (automatic),No
5,35,Female,6,99.65,597.9,Month-to-month,Electronic check,Yes`

    const blob = new Blob([sampleData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample_churn_data.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Data File</h3>
          <p className="text-sm text-gray-600">
            Upload a CSV or Excel file containing customer data for churn prediction analysis.
          </p>
        </div>

        {/* Drag and Drop Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : selectedFile
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          data-testid="drop-zone"
        >
          {selectedFile ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeFile}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
                <Button
                  onClick={uploadFile}
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload & Process
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Upload className="h-8 w-8 text-gray-600" />
                </div>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drag and drop your file here
                </p>
                <p className="text-sm text-gray-500">or</p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2"
                >
                  Browse Files
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Supports CSV, XLS, XLSX files up to 10MB
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <ProgressBar
              progress={uploadProgress}
              text={processingStage}
              color="blue"
              size="md"
              showPercentage={true}
              data-testid="progress-bar"
            />
          </motion.div>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            {uploadResult.success ? (
              <SuccessMessage
                title="Upload Successful"
                message={uploadResult.message}
                onDismiss={() => setUploadResult(null)}
              >
                {uploadResult.data && (
                  <div className="mt-3 p-3 bg-green-100 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-2">Processing Results:</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium">Total Records:</span> {uploadResult.data.total_records}
                      </div>
                      <div>
                        <span className="font-medium">Predictions Made:</span> {uploadResult.data.predictions_made}
                      </div>
                      <div>
                        <span className="font-medium">High Risk:</span> {uploadResult.data.high_risk_count}
                      </div>
                      <div>
                        <span className="font-medium">Avg Churn Score:</span> {uploadResult.data.avg_churn_score.toFixed(3)}
                      </div>
                    </div>
                  </div>
                )}
              </SuccessMessage>
            ) : (
              <ErrorMessage
                title="Upload Failed"
                message={uploadResult.message}
                onDismiss={() => setUploadResult(null)}
                onRetry={uploadFile}
              />
            )}
          </motion.div>
        )}
      </Card>

      {/* Sample File Download */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need a Sample File?</h3>
            <p className="text-sm text-gray-600">
              Download a sample CSV file to see the expected format for your data.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={downloadSampleFile}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download Sample</span>
          </Button>
        </div>
      </Card>

      {/* File Format Requirements */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">File Format Requirements</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Supported Formats:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• CSV files (.csv)</li>
              <li>• Excel files (.xls, .xlsx)</li>
              <li>• Maximum file size: 10MB</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Required Columns:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• customer_id: Unique identifier for each customer</li>
              <li>• age: Customer age</li>
              <li>• gender: Customer gender (Male/Female)</li>
              <li>• tenure: Number of months as customer</li>
              <li>• monthly_charges: Monthly service charges</li>
              <li>• total_charges: Total charges to date</li>
              <li>• contract_type: Contract type (Month-to-month/One year/Two year)</li>
              <li>• payment_method: Payment method used</li>
              <li>• churn: Actual churn status (Yes/No) - optional for predictions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Data Processing:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Data will be processed using machine learning models</li>
              <li>• Churn predictions will be generated for each customer</li>
              <li>• Results will be stored in your dashboard</li>
              <li>• High-risk customers will be flagged for attention</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
