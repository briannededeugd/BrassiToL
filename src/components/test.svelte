<script>
  function mouseovered(active) {
    return function (event, d) {
      let superTribeColor = findSuperTribeColor(d.data.name);

      // FINDING INFO
      let metadataObject = metadata.find((item) => item.SAMPLE === d.data.name);

      sampleNumber = metadataObject.SAMPLE;
      superTribeColor = findSuperTribeColor(sampleNumber);

      // Make the supertribe name the right color (according to the legend and tree)
      const span = d3.selectAll(".supertribespan");
      span.style("background-color", superTribeColor);

      svg.selectAll(".link").attr("stroke", "#405f7470");
      svg.selectAll("text.node").style("fill", "#405f7470");

      d3.select(this).select("path").attr("stroke", superTribeColor);
      d3.select(this).select("text").style("fill", superTribeColor);

      fullSpeciesName = metadataObject.SPECIES_NAME_PRINT;
      subfamilyName = metadataObject.SUBFAMILY;
      supertribeName = metadataObject.SUPERTRIBE;
      tribeName = metadataObject.TRIBE;

      if (active) {
        isTooltipHoverVisible = true; // Set flag indicating the smaller tooltip is visible
        tooltiphover
          .style("visibility", "visible")
          .style("left", calculateLeftPosition(event.clientX))
          .style("top", calculateTopPosition(event.clientY));

        // Change the color of all links and labels to grey
        svg.selectAll(".link").attr("stroke", "#405f7470");
        svg.selectAll("text.node").style("fill", "#405f7470");

        // Now highlight the path and label of the hovered node
        let currentNode = d;
        do {
          d3.select(currentNode.linkNode)
            .attr("stroke", superTribeColor)
            .raise();

          if (!currentNode.children) {
            // If it's a leaf node
            d3.select(currentNode.data.textNode).style("fill", superTribeColor);
          }

          currentNode = currentNode.parent;
        } while (currentNode);
      } else {
        isTooltipHoverVisible = false; // Reset flag when mouse leaves
        tooltiphover.style("visibility", "hidden");

        d3.select(d.linkNode).attr("stroke", "#E1E1E1"); // Reset the path color
        if (!d.children) {
          d3.select(d.data.textNode).style("fill", superTribeColor); // Reset the label color
        }

        // Re-apply the filter settings to the rest of the tree
        updateTreeColors(selectedSpecies);
      }
    };
  }

  // function pinInfo(active) {
  //   return function (event, d) {
  //     let superTribeColor = findSuperTribeColor(d.data.name);

  //     // FINDING INFO
  //     let metadataObject = metadata.find(
  //       (item) => item.SAMPLE === d.data.name,
  //     );

  //     // Capitalizing array items as well as strings
  //     function formatDescription(description) {
  //       if (Array.isArray(description)) {
  //         // If it's an array, apply the function to each element
  //         return description
  //           .map((item) => capitalizeFirstLetter(item))
  //           .join(", ");
  //       } else if (typeof description === "string" && description !== "NA") {
  //         // If it's a string and not "NA", capitalize the first letter of the first and last word
  //         const words = description.split(" ");
  //         if (words.length > 1) {
  //           words[0] = capitalizeFirstLetter(words[0]); // Capitalize the first word
  //           words[words.length - 1] = capitalizeFirstLetter(
  //             words[words.length - 1],
  //           ); // Capitalize the last word
  //           return words.join(" ");
  //         } else {
  //           // If there's only one word, just capitalize it
  //           return capitalizeFirstLetter(description);
  //         }
  //       }
  //       return description; // Return as is if none of the above conditions are met
  //     }

  //     // Making sure the meaning of each growth type appears instead of its short counterpart
  //     const growthFormLabelMapping = {
  //       H: "Herbaceous",
  //       W: "Woody",
  //     };

  //     sampleNumber = metadataObject.SAMPLE;
  //     superTribeColor = findSuperTribeColor(sampleNumber);

  //     // Make the supertribe name the right color (according to the legend and tree)
  //     const span = d3.selectAll(".supertribespan");
  //     span.style("background-color", superTribeColor);

  //     fullSpeciesName = metadataObject.SPECIES_NAME_PRINT;
  //     subfamilyName = metadataObject.SUBFAMILY;
  //     supertribeName = metadataObject.SUPERTRIBE;
  //     tribeName = metadataObject.TRIBE;
  //     lifeformName = formatDescription(
  //       metadataObject.WCVP_lifeform_description,
  //     );
  //     climateName = formatDescription(
  //       metadataObject.WCVP_climate_description,
  //     );
  //     growthformName = growthFormLabelMapping[metadataObject.GROWTH_FORM];
  //     societaluseName = formatDescription(metadataObject.SOCIETAL_USE);
  //     geographicareaName = metadataObject.WCVP_geographic_area;
  //     imageId = metadataObject.powo_identifier;

  //     if (active) {
  //       isTooltipHoverVisible = false; // Ensure the smaller tooltip is hidden when showing the larger one
  //       tooltip.style("visibility", "visible");

  //       // Change the color of all links and labels to grey
  //       svg.selectAll(".link").attr("stroke", "#405f7470");
  //       svg.selectAll("text.node").style("fill", "#405f7470");

  //       // Apply the active class to the hovered label and remove from others
  //       // d3.selectAll("text.node").classed("label--active", false); // Remove active class from all
  //       // d3.select(this).classed("label--active", active);

  //       d3.select(this).select("path").attr("stroke", superTribeColor);
  //       d3.select(this).select("text").style("fill", superTribeColor);

  //       // Now highlight the path and label of the hovered node
  //       let currentNode = d;
  //       do {
  //         d3.select(currentNode.linkNode)
  //           .attr("stroke", superTribeColor)
  //           .raise();

  //         if (!currentNode.children) {
  //           // If it's a leaf node
  //           d3.select(currentNode.data.textNode).style(
  //             "fill",
  //             superTribeColor,
  //           );
  //         }

  //         currentNode = currentNode.parent;
  //       } while (currentNode);
  //     } else {
  //       tooltip.style("visibility", "hidden");

  //       d3.selectAll(".node")
  //         .filter(function () {
  //           return d3.select(this).attr("data-name") == d.data.name;
  //         })
  //         .each(function () {
  //           d3.select(this).select("path").attr("stroke", "#405f7470");
  //           d3.select(this).select("text").style("fill", "#405f7470");
  //         });

  //       d3.select(d.linkNode).attr("stroke", "#E1E1E1"); // Reset the path color
  //       if (!d.children) {
  //         d3.select(d.data.textNode).style("fill", superTribeColor); // Reset the label color
  //       }

  //       // Re-apply the filter settings to the rest of the tree
  //       updateTreeColors(selectedSpecies);
  //     }

  //     // if (active && !isTooltipPinned) {
  //     //   tooltip.style("visibility", "visible");

  //     //   /**====================
  //     //    *     TREE EDITS
  //     //    *===================**/

  //     //   // Change the color of all links and labels to grey
  //     //   svg.selectAll(".link").attr("stroke", "#405f7470");
  //     //   svg.selectAll("text.node").style("fill", "#405f7470");

  //     //   // Now highlight the path and label of the hovered node
  //     //   let currentNode = d;
  //     //   do {
  //     //     d3.select(currentNode.linkNode)
  //     //       .attr("stroke", superTribeColor)
  //     //       .raise();

  //     //     if (!currentNode.children) {
  //     //       // If it's a leaf node
  //     //       d3.select(currentNode.data.textNode).style(
  //     //         "fill",
  //     //         superTribeColor,
  //     //       );
  //     //     }

  //     //     currentNode = currentNode.parent;
  //     //   } while (currentNode);
  //     // } else if (!active && !isTooltipPinned) {
  //     //   tooltip.style("visibility", "hidden");

  //     //   d3.select(d.linkNode).attr("stroke", "#E1E1E1"); // Reset the path color
  //     //   if (!d.children) {
  //     //     d3.select(d.data.textNode).style("fill", superTribeColor); // Reset the label color
  //     //   }

  //     //   // Re-apply the filter settings to the rest of the tree
  //     //   updateTreeColors(selectedSpecies);
  //     // }
  //   };
  // }

  // function calculateLeftPosition(clientX) {
  //   if (clientX > 1200) {
  //     return clientX - 500 + "px";
  //   } else if (clientX > 1060) {
  //     return clientX - 500 + "px";
  //   } else if (clientX > 490) {
  //     return clientX + 200 + "px";
  //   } else {
  //     return clientX + 400 + "px";
  //   }
  // }

  // function calculateTopPosition(clientY) {
  //   if (clientX > 1060) {
  //     return clientY + 80 + "px";
  //   } else if (clientX < 400 && clientY > 120) {
  //     return clientY + 50 + "px";
  //   } else if (clientX < 400) {
  //     return clientY - 200 + "px";
  //   } else {
  //     return clientY - 20 + "px";
  //   }
  // }
</script>
