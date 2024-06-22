package com.backendVn.SWP.services;

import com.backendVn.SWP.dtos.request.DesignCreationRequest;
import com.backendVn.SWP.dtos.request.DesignUpdateRequest;
import com.backendVn.SWP.dtos.response.DesignResponse;
import com.backendVn.SWP.entities.Design;
import com.backendVn.SWP.entities.RequestOrder;
import com.backendVn.SWP.exception.AppException;
import com.backendVn.SWP.exception.ErrorCode;
import com.backendVn.SWP.mappers.DesignMapper;
import com.backendVn.SWP.repositories.DesignRepository;
import com.backendVn.SWP.repositories.RequestOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class DesignService {
    DesignRepository designRepository;
    DesignMapper designMapper;
    RequestOrderRepository requestOrderRepository;

    public String createCSV(List<String> listUrRLImage){
        String uRLImage = "";

        for(String imageURL : listUrRLImage){
            if (uRLImage.isEmpty()){
                uRLImage = imageURL;
            } else {
                uRLImage = "," + imageURL;
            }
        }

        return uRLImage;
    }

    public List<String> brokeCSV(String uRLImage){
        return Arrays.stream(uRLImage.split(",")).toList();
    }

    public DesignResponse createDesign(DesignCreationRequest designCreationRequest, Integer requestOrderId){
        RequestOrder requestOrder = requestOrderRepository.findById(requestOrderId)
                .orElseThrow(() -> new AppException(ErrorCode.REQUEST_ORDER_NOT_FOUND));

        Design design = designMapper.toDesign(designCreationRequest);
        design.setURLImage(createCSV(designCreationRequest.getListURLImage()));

        Design savedDesign = designRepository.save(design);

        DesignResponse designResponse = designMapper.toDesignResponse(savedDesign);
        designResponse.setListURLImage(brokeCSV(design.getURLImage()));

        return designResponse;
    }

    public List<DesignResponse> getAllDesign() {
        return designRepository.findAll().stream()
                .map(designMapper::toDesignResponse).toList();
    }

    public void deleteDesign(Integer id) {
        designRepository.deleteById(id);
    }

    public DesignResponse updateDesign(Integer id, DesignUpdateRequest designUpdateRequest) {
        Design design = designRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DESIGN_NOT_FOUND));
        designMapper.updateDesign(design, designUpdateRequest);
        return designMapper.toDesignResponse(designRepository.save(design));
    }

    public DesignResponse getDesignById(Integer id) {
        return designMapper.toDesignResponse(designRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DESIGN_NOT_FOUND)));
    }
}
