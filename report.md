# Gap report

Generated 2026-07-24T17:18:40.615Z from TypeScript-DOM-lib-generator `a193ecb2b75a`.

These are declarations present when the two-engine rule is relaxed to **one** stable engine, but absent from the stock baseline.

The package ships in two flavors. **Replace** provides a complete lib for each environment, used in place of TypeScript's built-in (`@types/web` model):

- `modern-web-types` — replaces `DOM`
- `modern-web-types/webworker` — replaces `WebWorker`
- `modern-web-types/serviceworker` — replaces `ServiceWorker` (standalone; not a built-in TypeScript lib)
- `modern-web-types/sharedworker` — replaces `SharedWorker` (standalone; not a built-in TypeScript lib)
- `modern-web-types/audioworklet` — replaces `AudioWorklet` (standalone; not a built-in TypeScript lib)

**Augment** ships per-spec files (under the `augment/` subpath) that merge the single-engine delta into your existing lib; it covers the two environments with a built-in TypeScript lib (`DOM`, `WebWorker`). The per-scope counts below describe that delta.

## dom scope (lib `DOM`)

Augment entry points: `modern-web-types/augment/…`.

| Category | Count |
| --- | ---: |
| New interfaces | 431 |
| New type aliases | 93 |
| New global vars | 214 |
| New global functions | 8 |
| Members added to existing interfaces | 336 |
| Skipped (unmergeable) | 10 |

<details><summary>431 new interfaces</summary>

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
- `CSSContainerCondition`
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

<details><summary>10 skipped (cannot merge)</summary>

Each differs from an existing lib declaration in a way declaration merging can't express (a changed property type, a widened type alias, a re-typed `declare var`, a maplike mutator, or an `extends` base that doesn't exist in this scope). Handle with a manual override if needed.

- `TrackEventInit.track` — property-type-changed
- `CSSFontFeatureValuesMap` — maplike-mutator-dropped
- `TrackEvent.track` — property-type-changed
- `Transferable` — type-alias-changed
- `DeviceMotionEvent` — var-changed
- `DeviceOrientationEvent` — var-changed
- `Document` — var-changed
- `PaymentRequest` — var-changed
- `ReadableStream` — var-changed
- `WebTransport` — var-changed

</details>

## webworker scope (lib `WebWorker`)

Augment entry points: `modern-web-types/augment/…worker`.

| Category | Count |
| --- | ---: |
| New interfaces | 141 |
| New type aliases | 34 |
| New global vars | 55 |
| New global functions | 1 |
| Members added to existing interfaces | 63 |
| Skipped (unmergeable) | 5 |

<details><summary>141 new interfaces</summary>

- `AddressErrors`
- `AddressInit`
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

<details><summary>5 skipped (cannot merge)</summary>

Each differs from an existing lib declaration in a way declaration merging can't express (a changed property type, a widened type alias, a re-typed `declare var`, a maplike mutator, or an `extends` base that doesn't exist in this scope). Handle with a manual override if needed.

- `ManagedMediaSource` — heritage-base-unresolved (MediaSource)
- `ManagedSourceBuffer` — heritage-base-unresolved (SourceBuffer)
- `Transferable` — type-alias-changed
- `ReadableStream` — var-changed
- `WebTransport` — var-changed

</details>

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
