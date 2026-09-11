# Gap report

Generated 2026-09-11T03:23:28.560Z from TypeScript-DOM-lib-generator `245655f1e887`.

These are declarations present when the two-engine rule is relaxed to **one** stable engine, but absent from the stock baseline.

The per-scope counts below are that gap, measured for the two environments TypeScript ships a lib for (`DOM`, `WebWorker`).

## dom scope (lib `DOM`)

| Category | Count |
| --- | ---: |
| New interfaces | 433 |
| New type aliases | 96 |
| New global vars | 214 |
| New global functions | 9 |
| Members added to existing interfaces | 311 |

<details><summary>433 new interfaces</summary>

- `AbsoluteOrientationSensor`
- `Accelerometer`
- `AccelerometerSensorOptions`
- `ActivationBlockersMixin`
- `ActivationBlockersMixinEventMap`
- `AnimationTrigger`
- `AnimationTriggerOptions`
- `AudioContextEventMap`
- `AudioOutputOptions`
- `AudioPlaybackStats`
- `AudioSession`
- `AudioSinkInfo`
- `AudioSinkOptions`
- `AudioTrack`
- `AudioTrackList`
- `AudioTrackListEventMap`
- `BackgroundBlur`
- `BackgroundFetchManager`
- `BackgroundFetchOptions`
- `BackgroundFetchRecord`
- `BackgroundFetchRegistration`
- `BackgroundFetchRegistrationEventMap`
- `BackgroundFetchUIOptions`
- `BackgroundSyncOptions`
- `BarcodeDetector`
- `BarcodeDetectorOptions`
- `BatteryManager`
- `BatteryManagerEventMap`
- `BeforeInstallPromptEvent`
- `Bluetooth`
- `BluetoothCharacteristicProperties`
- `BluetoothDataFilterInit`
- `BluetoothDevice`
- `BluetoothDeviceEventHandlers`
- `BluetoothDeviceEventHandlersEventMap`
- `BluetoothDeviceEventMap`
- `BluetoothEventMap`
- `BluetoothLEScanFilterInit`
- `BluetoothManufacturerDataFilterInit`
- `BluetoothRemoteGATTCharacteristic`
- `BluetoothRemoteGATTDescriptor`
- `BluetoothRemoteGATTServer`
- `BluetoothRemoteGATTService`
- `BluetoothServiceDataFilterInit`
- `BluetoothUUID`
- `BrowserCaptureMediaStreamTrack`
- `BufferedChangeEvent`
- `BufferedChangeEventInit`
- `CSSFontFeatureValuesMap`
- `CSSFunctionDeclarations`
- `CSSFunctionDescriptors`
- `CSSFunctionRule`
- `CSSMarginRule`
- `CSSPseudoElement`
- `CaptureController`
- `CaptureControllerEventMap`
- `CaptureHandle`
- `CaptureHandleConfig`
- `CatchCallback`
- `ChapterInformation`
- `CharacterBoundsUpdateEvent`
- `CharacterBoundsUpdateEventInit`
- `CharacteristicEventHandlers`
- `CharacteristicEventHandlersEventMap`
- `ClipboardChangeEvent`
- `ClipboardChangeEventInit`
- `ColorSelectionOptions`
- `ColorSelectionResult`
- `ContactInfo`
- `ContactsManager`
- `ContactsSelectOptions`
- `ContentDescription`
- `ContentIndex`
- `CrashReportContext`
- `CreateMonitor`
- `CreateMonitorCallback`
- `CreateMonitorEventMap`
- `CredentialData`
- `CredentialUserData`
- `CropTarget`
- `DataCue`
- `DeferredRequestInit`
- `DelegatedInkTrailPresenter`
- `DestroyableModel`
- `DetectedBarcode`
- `DevicePosture`
- `DevicePostureEventMap`
- `DirectoryPickerOptions`
- `EXT_disjoint_timer_query`
- `EXT_disjoint_timer_query_webgl2`
- `EditContext`
- `EditContextEventMap`
- `EditContextInit`
- `EyeDropper`
- `FederatedCredential`
- `FederatedCredentialInit`
- `Fence`
- `FenceEvent`
- `FencedFrameConfig`
- `FetchLaterResult`
- `FilePickerAcceptType`
- `FilePickerOptions`
- `FileSystemHandlePermissionDescriptor`
- `FontData`
- `FunctionParameter`
- `GamepadPose`
- `GlobalPrivacyControl`
- `GravitySensor`
- `Gyroscope`
- `GyroscopeSensorOptions`
- `HID`
- `HIDCollectionInfo`
- `HIDConnectionEvent`
- `HIDConnectionEventInit`
- `HIDDevice`
- `HIDDeviceEventMap`
- `HIDDeviceFilter`
- `HIDDeviceRequestOptions`
- `HIDEventMap`
- `HIDInputReportEvent`
- `HIDInputReportEventInit`
- `HIDReportInfo`
- `HIDReportItem`
- `HTMLFencedFrameElement`
- `HTMLGeolocationElement`
- `HTMLGeolocationElementEventMap`
- `HTMLSelectedContentElement`
- `IDBGetAllOptions`
- `IDBRecord`
- `IdentityCredential`
- `IdentityCredentialDisconnectOptions`
- `IdentityCredentialError`
- `IdentityCredentialErrorInit`
- `IdentityProvider`
- `IdentityProviderConfig`
- `IdentityResolveOptions`
- `IdentityUserInfo`
- `IdleDetector`
- `IdleDetectorEventMap`
- `IdleOptions`
- `ImageResource`
- `Ink`
- `InkPresenterParam`
- `InkTrailStyle`
- `InputDeviceCapabilities`
- `InputDeviceCapabilitiesInit`
- `IsInputPendingOptions`
- `Keyboard`
- `KeyboardLayoutMap`
- `LanguageDetectionResult`
- `LanguageDetector`
- `LanguageDetectorCreateCoreOptions`
- `LanguageDetectorCreateOptions`
- `LanguageDetectorDetectOptions`
- `LanguageModel`
- `LanguageModelAppendOptions`
- `LanguageModelCloneOptions`
- `LanguageModelCreateCoreOptions`
- `LanguageModelCreateOptions`
- `LanguageModelEventMap`
- `LanguageModelExpected`
- `LanguageModelMessage`
- `LanguageModelMessageContent`
- `LanguageModelPromptOptions`
- `LanguageModelTool`
- `LanguageModelToolFunction`
- `LaunchConsumer`
- `LaunchParams`
- `LaunchQueue`
- `LayoutShift`
- `LayoutShiftAttribution`
- `LinearAccelerationSensor`
- `ManagedMediaSource`
- `ManagedMediaSourceEventMap`
- `ManagedSourceBuffer`
- `ManagedSourceBufferEventMap`
- `Mapper`
- `MediaEffectInfo`
- `MediaStreamTrackAudioSourceNode`
- `MediaStreamTrackAudioSourceOptions`
- `MemoryAttribution`
- `MemoryAttributionContainer`
- `MemoryBreakdownEntry`
- `MemoryMeasurement`
- `NDEFMakeReadOnlyOptions`
- `NDEFMessage`
- `NDEFMessageInit`
- `NDEFReader`
- `NDEFReaderEventMap`
- `NDEFReadingEvent`
- `NDEFReadingEventInit`
- `NDEFRecord`
- `NDEFRecordInit`
- `NDEFScanOptions`
- `NDEFWriteOptions`
- `NavigatorDeviceMemory`
- `NavigatorManagedData`
- `NavigatorManagedDataEventMap`
- `NavigatorNetworkInformation`
- `NavigatorStorageBuckets`
- `NavigatorUA`
- `NavigatorUABrandVersion`
- `NavigatorUAData`
- `NetworkInformation`
- `NetworkInformationEventMap`
- `NetworkInformationSaveData`
- `NotRestoredReasonDetails`
- `NotRestoredReasons`
- `OTPCredential`
- `Observable`
- `ObservableEventListenerOptions`
- `ObservableInspector`
- `ObservableInspectorAbortHandler`
- `ObservableSubscriptionCallback`
- `OpenFilePickerOptions`
- `OrientationSensor`
- `OrientationSensorOptions`
- `PasswordCredential`
- `PasswordCredentialData`
- `PaymentManager`
- `PerformanceElementTiming`
- `PerformanceLongAnimationFrameTiming`
- `PerformanceLongTaskTiming`
- `PerformanceScriptTiming`
- `PerformanceTimingConfidence`
- `PeriodicSyncManager`
- `Point2D`
- `PowerfulFeatureObserver`
- `PowerfulFeatureObserverEventMap`
- `Predicate`
- `Presentation`
- `PresentationAvailability`
- `PresentationAvailabilityEventMap`
- `PresentationConnection`
- `PresentationConnectionAvailableEvent`
- `PresentationConnectionAvailableEventInit`
- `PresentationConnectionCloseEvent`
- `PresentationConnectionCloseEventInit`
- `PresentationConnectionEventMap`
- `PresentationConnectionList`
- `PresentationConnectionListEventMap`
- `PresentationReceiver`
- `PresentationRequest`
- `PresentationRequestEventMap`
- `PressureObserver`
- `PressureObserverOptions`
- `PressureRecord`
- `PressureUpdateCallback`
- `PrivateToken`
- `Profiler`
- `ProfilerFrame`
- `ProfilerInitOptions`
- `ProfilerSample`
- `ProfilerStack`
- `ProfilerTrace`
- `PromptResponseObject`
- `QueryOptions`
- `QuotaExceededError`
- `QuotaExceededErrorOptions`
- `RTCIceParameters`
- `RTCIdentityAssertion`
- `RTCIdentityProviderOptions`
- `Reducer`
- `RelatedApplication`
- `RelativeOrientationSensor`
- `RequestDeviceOptions`
- `RestrictionTarget`
- `SVGPathData`
- `SVGPathDataSettings`
- `SaveFilePickerOptions`
- `Scheduling`
- `ScreenDetailed`
- `ScreenDetails`
- `ScreenDetailsEventMap`
- `ScreenEventMap`
- `Segment`
- `Sensor`
- `SensorErrorEvent`
- `SensorErrorEventInit`
- `SensorEventMap`
- `SensorOptions`
- `SharedWorkerOptions`
- `SnapEvent`
- `SnapEventInit`
- `SpeechGrammarList`
- `SpeechRecognition`
- `SpeechRecognitionEventMap`
- `SpeechRecognitionOptions`
- `SpeechRecognitionPhrase`
- `StorageAccessHandle`
- `StorageBucket`
- `StorageBucketManager`
- `StorageBucketOptions`
- `SubscribeCallback`
- `SubscribeOptions`
- `Subscriber`
- `SubscriptionObserver`
- `Summarizer`
- `SummarizerCreateCoreOptions`
- `SummarizerCreateOptions`
- `SummarizerSummarizeOptions`
- `SyncManager`
- `TaskAttributionTiming`
- `TextFormat`
- `TextFormatInit`
- `TextFormatUpdateEvent`
- `TextFormatUpdateEventInit`
- `TextUpdateEvent`
- `TextUpdateEventInit`
- `TimeEvent`
- `Translator`
- `TranslatorCreateCoreOptions`
- `TranslatorCreateOptions`
- `TranslatorTranslateOptions`
- `UADataValues`
- `UALowEntropyJSON`
- `USB`
- `USBAlternateInterface`
- `USBConfiguration`
- `USBConnectionEvent`
- `USBConnectionEventInit`
- `USBControlTransferParameters`
- `USBDevice`
- `USBDeviceFilter`
- `USBDeviceRequestOptions`
- `USBEndpoint`
- `USBEventMap`
- `USBInTransferResult`
- `USBInterface`
- `USBIsochronousInTransferPacket`
- `USBIsochronousInTransferResult`
- `USBIsochronousOutTransferPacket`
- `USBIsochronousOutTransferResult`
- `USBOutTransferResult`
- `VideoFrameMetadata`
- `VideoTrack`
- `VideoTrackList`
- `VideoTrackListEventMap`
- `Viewport`
- `VirtualKeyboard`
- `VirtualKeyboardEventMap`
- `VisibilityStateEntry`
- `Visitor`
- `WebGLObject`
- `WebGLTimerQueryEXT`
- `WebTransportDatagramsWritable`
- `WebTransportSendGroup`
- `WindowControlsOverlay`
- `WindowControlsOverlayEventMap`
- `WindowControlsOverlayGeometryChangeEvent`
- `WindowControlsOverlayGeometryChangeEventInit`
- `XRAnchor`
- `XRAnchorSet`
- `XRBoundedReferenceSpace`
- `XRCPUDepthInformation`
- `XRCamera`
- `XRCompositionLayer`
- `XRCubeLayer`
- `XRCubeLayerEventMap`
- `XRCubeLayerInit`
- `XRCylinderLayer`
- `XRCylinderLayerEventMap`
- `XRCylinderLayerInit`
- `XRDOMOverlayInit`
- `XRDOMOverlayState`
- `XRDepthInformation`
- `XRDepthStateInit`
- `XREquirectLayer`
- `XREquirectLayerEventMap`
- `XREquirectLayerInit`
- `XRFrame`
- `XRFrameRequestCallback`
- `XRHand`
- `XRHandIterator`
- `XRHitTestOptionsInit`
- `XRHitTestResult`
- `XRHitTestSource`
- `XRInputSource`
- `XRInputSourceArray`
- `XRInputSourceEvent`
- `XRInputSourceEventInit`
- `XRInputSourcesChangeEvent`
- `XRInputSourcesChangeEventInit`
- `XRJointPose`
- `XRJointSpace`
- `XRLayer`
- `XRLayerEvent`
- `XRLayerEventInit`
- `XRLayerInit`
- `XRLightEstimate`
- `XRLightProbe`
- `XRLightProbeEventMap`
- `XRLightProbeInit`
- `XRPlane`
- `XRPlaneSet`
- `XRPose`
- `XRProjectionLayer`
- `XRProjectionLayerInit`
- `XRQuadLayer`
- `XRQuadLayerEventMap`
- `XRQuadLayerInit`
- `XRRay`
- `XRRayDirectionInit`
- `XRReferenceSpace`
- `XRReferenceSpaceEvent`
- `XRReferenceSpaceEventInit`
- `XRReferenceSpaceEventMap`
- `XRRenderState`
- `XRRenderStateInit`
- `XRRigidTransform`
- `XRSession`
- `XRSessionEvent`
- `XRSessionEventInit`
- `XRSessionEventMap`
- `XRSessionInit`
- `XRSpace`
- `XRSubImage`
- `XRSystem`
- `XRSystemEventMap`
- `XRTransientInputHitTestOptionsInit`
- `XRTransientInputHitTestResult`
- `XRTransientInputHitTestSource`
- `XRView`
- `XRViewGeometry`
- `XRViewerPose`
- `XRViewport`
- `XRVisibilityMaskChangeEvent`
- `XRVisibilityMaskChangeEventInit`
- `XRWebGLBinding`
- `XRWebGLDepthInformation`
- `XRWebGLLayer`
- `XRWebGLLayerInit`
- `XRWebGLSubImage`

</details>

## webworker scope (lib `WebWorker`)

| Category | Count |
| --- | ---: |
| New interfaces | 144 |
| New type aliases | 35 |
| New global vars | 55 |
| New global functions | 1 |
| Members added to existing interfaces | 64 |

<details><summary>144 new interfaces</summary>

- `AddressErrors`
- `AddressInit`
- `BackgroundBlur`
- `BackgroundFetchEvent`
- `BackgroundFetchEventInit`
- `BackgroundFetchManager`
- `BackgroundFetchOptions`
- `BackgroundFetchRecord`
- `BackgroundFetchRegistration`
- `BackgroundFetchRegistrationEventMap`
- `BackgroundFetchUIOptions`
- `BackgroundFetchUpdateUIEvent`
- `BackgroundSyncOptions`
- `BarcodeDetector`
- `BarcodeDetectorOptions`
- `BufferedChangeEvent`
- `BufferedChangeEventInit`
- `CanMakePaymentEvent`
- `CatchCallback`
- `ContentDescription`
- `ContentIndex`
- `ContentIndexEvent`
- `ContentIndexEventInit`
- `CropTarget`
- `DetectedBarcode`
- `EXT_disjoint_timer_query`
- `EXT_disjoint_timer_query_webgl2`
- `FileSystemHandlePermissionDescriptor`
- `GlobalPrivacyControl`
- `HID`
- `HIDCollectionInfo`
- `HIDConnectionEvent`
- `HIDConnectionEventInit`
- `HIDDevice`
- `HIDDeviceEventMap`
- `HIDEventMap`
- `HIDInputReportEvent`
- `HIDInputReportEventInit`
- `HIDReportInfo`
- `HIDReportItem`
- `IDBGetAllOptions`
- `IDBRecord`
- `IdleDetector`
- `IdleDetectorEventMap`
- `IdleOptions`
- `ImageResource`
- `InstallEvent`
- `ManagedMediaSource`
- `ManagedMediaSourceEventMap`
- `ManagedSourceBuffer`
- `ManagedSourceBufferEventMap`
- `Mapper`
- `MediaEffectInfo`
- `MemoryAttribution`
- `MemoryAttributionContainer`
- `MemoryBreakdownEntry`
- `MemoryMeasurement`
- `NavigatorDeviceMemory`
- `NavigatorNetworkInformation`
- `NavigatorStorageBuckets`
- `NavigatorUA`
- `NavigatorUABrandVersion`
- `NavigatorUAData`
- `NetworkInformation`
- `NetworkInformationEventMap`
- `NetworkInformationSaveData`
- `Observable`
- `ObservableEventListenerOptions`
- `ObservableInspector`
- `ObservableInspectorAbortHandler`
- `ObservableSubscriptionCallback`
- `PaymentCurrencyAmount`
- `PaymentDetailsModifier`
- `PaymentHandlerResponse`
- `PaymentItem`
- `PaymentMethodData`
- `PaymentOptions`
- `PaymentRequestDetailsUpdate`
- `PaymentRequestEvent`
- `PaymentRequestEventInit`
- `PaymentShippingOption`
- `PeriodicSyncEvent`
- `PeriodicSyncEventInit`
- `PeriodicSyncManager`
- `Point2D`
- `Predicate`
- `PressureObserver`
- `PressureObserverOptions`
- `PressureRecord`
- `PressureUpdateCallback`
- `PrivateToken`
- `Profiler`
- `ProfilerFrame`
- `ProfilerInitOptions`
- `ProfilerSample`
- `ProfilerStack`
- `ProfilerTrace`
- `QuotaExceededError`
- `QuotaExceededErrorOptions`
- `Reducer`
- `RestrictionTarget`
- `RouterCondition`
- `RouterRule`
- `RouterSourceDict`
- `Segment`
- `Sensor`
- `SensorErrorEvent`
- `SensorErrorEventInit`
- `SensorEventMap`
- `StorageBucket`
- `StorageBucketManager`
- `StorageBucketOptions`
- `SubscribeCallback`
- `SubscribeOptions`
- `Subscriber`
- `SubscriptionObserver`
- `SyncEvent`
- `SyncEventInit`
- `SyncManager`
- `UADataValues`
- `UALowEntropyJSON`
- `USB`
- `USBAlternateInterface`
- `USBConfiguration`
- `USBConnectionEvent`
- `USBConnectionEventInit`
- `USBControlTransferParameters`
- `USBDevice`
- `USBEndpoint`
- `USBEventMap`
- `USBInTransferResult`
- `USBInterface`
- `USBIsochronousInTransferPacket`
- `USBIsochronousInTransferResult`
- `USBIsochronousOutTransferPacket`
- `USBIsochronousOutTransferResult`
- `USBOutTransferResult`
- `VideoFrameMetadata`
- `VideoTrackGenerator`
- `Visitor`
- `WebGLObject`
- `WebGLTimerQueryEXT`
- `WebTransportDatagramsWritable`
- `WebTransportSendGroup`

</details>

## Performance entry types

The libs type `getEntriesByType()` and `getEntriesByName()` by their `entryType` argument, from the [timing entry types registry](https://github.com/w3c/timing-entrytypes-registry/tree/e7bd634123c5a31f29e2b023dc484f24eedd84a9) — data the generator has no source for, since Web IDL doesn't record which interface an entry type produces. An entry type the registry doesn't list, or a non-literal argument, still resolves through the original `PerformanceEntry[]` signature.

| `entryType` | Interface | Reachable from | Scopes |
| --- | --- | --- | --- |
| `"element"` | `PerformanceElementTiming` | `PerformanceObserver` | `dom` |
| `"event"` | `PerformanceEventTiming` | `PerformanceObserver` | `dom` |
| `"first-input"` | `PerformanceEventTiming` | `Performance`, `PerformanceObserver` | `dom` |
| `"largest-contentful-paint"` | `LargestContentfulPaint` | `PerformanceObserver` | `dom` |
| `"layout-shift"` | `LayoutShift` | `PerformanceObserver` | `dom` |
| `"long-animation-frame"` | `PerformanceLongAnimationFrameTiming` | `Performance`, `PerformanceObserver` | `dom` |
| `"longtask"` | `PerformanceLongTaskTiming` | `PerformanceObserver` | `dom` |
| `"mark"` | `PerformanceMark` | `Performance`, `PerformanceObserver` | `dom`, `webworker`, `serviceworker`, `sharedworker` |
| `"measure"` | `PerformanceMeasure` | `Performance`, `PerformanceObserver` | `dom`, `webworker`, `serviceworker`, `sharedworker` |
| `"navigation"` | `PerformanceNavigationTiming` | `Performance`, `PerformanceObserver` | `dom` |
| `"paint"` | `PerformancePaintTiming` | `Performance`, `PerformanceObserver` | `dom` |
| `"resource"` | `PerformanceResourceTiming` | `Performance`, `PerformanceObserver` | `dom`, `webworker`, `serviceworker`, `sharedworker` |

## Unknown-type fallbacks

The relaxed build referenced types the emitter couldn't resolve — usually a referenced feature whose own definition was dropped or renamed upstream. These were emitted as `any` (e.g. `getDigitalGoodsService(): Promise<any>`).

```
MWT: unknown DOM type ContactAddress, emitting "any"
MWT: unknown DOM type SVGPathSegment, emitting "any"
MWT: unknown DOM type SpeechGrammar, emitting "any"
MWT: unknown DOM type DigitalGoodsService, emitting "any"
MWT: unknown DOM type TimeRanges, emitting "any"
MWT: unknown DOM type PaymentManager, emitting "any"
MWT: unknown DOM type MediaStreamTrack, emitting "any"
```
